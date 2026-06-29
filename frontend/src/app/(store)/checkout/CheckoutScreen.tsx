'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import CircularProgress from '@mui/material/CircularProgress';
import { useGetCartQuery, type Cart } from '@/store/cartApi';
import { useCreatePaymentIntentMutation, type PaymentIntentResponse } from '@/store/checkoutApi';
import { useCreateOrderMutation, type ShippingAddress } from '@/store/ordersApi';
import { normalizeApiError } from '@/store/normalizeError';
import { useAuth } from '@/store/useAuth';
import { stripePromise } from '@/lib/stripe';
import EmptyState from '@/components/EmptyState';
import { money } from '@/theme/format';
import { radii, emerald, storefront, stock as stockColors } from '@/theme/tokens';

const containerSx = { maxWidth: 1100, mx: 'auto' } as const;

interface FormValues {
  fullName: string;
  email: string;
  street: string;
  city: string;
  postalCode: string;
}

/** Mirrors the server `ShippingAddressDto` (class-validator) rules. */
const schema = yup.object({
  fullName: yup
    .string()
    .trim()
    .min(2, 'Enter your full name')
    .max(100, 'Name is too long')
    .required('Full name is required'),
  email: yup.string().trim().email('Enter a valid email').required('Email is required'),
  street: yup
    .string()
    .trim()
    .min(2, 'Enter your street address')
    .max(200, 'Address is too long')
    .required('Street address is required'),
  city: yup.string().trim().min(1, 'Enter your city').max(100, 'City is too long').required('City is required'),
  postalCode: yup
    .string()
    .trim()
    .min(2, 'Enter your postal code')
    .max(20, 'Postal code is too long')
    .required('Postal code is required'),
});

/**
 * `/checkout` — three sections (Contact, Shipping address, Payment) plus a
 * sticky Order summary. Loads the cart and creates a PaymentIntent up front; the
 * intent response decides whether we mount Stripe Elements (real key) or take
 * the clearly-marked mock path (no `clientSecret`).
 */
export default function CheckoutScreen() {
  const router = useRouter();
  const { data: cart, isLoading: cartLoading, isError: cartError, error: cartErr, refetch } = useGetCartQuery();
  const [createIntent] = useCreatePaymentIntentMutation();

  const [intent, setIntent] = React.useState<PaymentIntentResponse | null>(null);
  const [intentError, setIntentError] = React.useState<string | null>(null);

  const isEmpty = !cartLoading && !cartError && (cart?.items.length ?? 0) === 0;

  // Create the PaymentIntent once the cart is known to be non-empty.
  React.useEffect(() => {
    if (cartLoading || cartError || isEmpty || intent) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await createIntent().unwrap();
        if (!cancelled) setIntent(res);
      } catch (err) {
        if (!cancelled) setIntentError(normalizeApiError(err as never).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cartLoading, cartError, isEmpty, intent, createIntent]);

  if (cartLoading) return <CheckoutSkeleton />;

  if (cartError) {
    return (
      <Section>
        <Heading />
        <Alert
          severity="error"
          sx={{ borderRadius: '12px' }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          {normalizeApiError(cartErr as never).message}
        </Alert>
      </Section>
    );
  }

  if (isEmpty) {
    return (
      <Section>
        <Heading />
        <EmptyState
          title="Your cart is empty"
          subtitle="Add a few considered essentials before checking out."
          actionLabel="Continue shopping"
          onAction={() => router.push('/')}
        />
      </Section>
    );
  }

  // Always mount the form inside <Elements> so the Stripe hooks are valid even
  // during the loading window and on the mock path (useStripe() throws if called
  // outside a provider). When a real clientSecret is present we pass it so the
  // PaymentElement renders; the `key` forces a clean remount when it arrives.
  const hasStripe = Boolean(intent && !intent.mock && intent.clientSecret);
  const elementsOptions = intent?.clientSecret
    ? {
        clientSecret: intent.clientSecret,
        appearance: {
          theme: 'stripe' as const,
          variables: {
            colorPrimary: emerald.main,
            colorText: storefront.ink,
            borderRadius: `${radii.sm}px`,
            fontFamily: 'inherit',
          },
        },
      }
    : undefined;

  return (
    <Section>
      <Heading />
      <Elements
        key={intent?.clientSecret ?? 'no-secret'}
        stripe={stripePromise}
        options={elementsOptions}
      >
        <CheckoutForm cart={cart!} intent={intent} intentError={intentError} hasStripe={hasStripe} />
      </Elements>
    </Section>
  );
}

interface CheckoutFormProps {
  cart: Cart;
  intent: PaymentIntentResponse | null;
  intentError: string | null;
  hasStripe: boolean;
}

/**
 * The form body. Lives inside `<Elements>` when `hasStripe`, so the Stripe
 * hooks are available; in mock mode they return null and are skipped.
 */
function CheckoutForm({ cart, intent, intentError, hasStripe }: CheckoutFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const [createOrder, orderState] = useCreateOrderMutation();

  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [paying, setPaying] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: user?.name ?? '',
      email: user?.email ?? '',
      street: '',
      city: '',
      postalCode: '',
    },
    mode: 'onTouched',
  });

  // Cannot pay until the intent has been created (real or mock).
  const intentReady = Boolean(intent) || Boolean(intentError);
  const busy = paying || orderState.isLoading;

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    if (!intent) {
      setSubmitError(intentError ?? 'Payment is not ready yet. Please try again in a moment.');
      return;
    }

    const shippingAddress: ShippingAddress = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      street: values.street.trim(),
      city: values.city.trim(),
      postalCode: values.postalCode.trim(),
    };

    setPaying(true);
    try {
      // Real Stripe path: confirm the payment with the PaymentElement first.
      if (hasStripe) {
        if (!stripe || !elements) {
          setSubmitError('Payment form is still loading. Please try again in a moment.');
          return;
        }
        const { error } = await stripe.confirmPayment({
          elements,
          redirect: 'if_required',
        });
        if (error) {
          setSubmitError(error.message ?? 'Payment could not be confirmed. Please check your card details.');
          return;
        }
      }
      // Mock path falls straight through to placing the order (no real charge).

      const order = await createOrder({
        shippingAddress,
        paymentIntentId: intent.paymentIntentId,
      }).unwrap();

      router.push(`/order-confirmed/${order.id}`);
    } catch (err) {
      const norm = normalizeApiError(err as never);
      // 409 = out of stock (a line went out of stock between cart and checkout).
      setSubmitError(
        norm.status === 409
          ? `${norm.message} Please review your cart and try again.`
          : norm.message,
      );
    } finally {
      setPaying(false);
    }
  });

  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      noValidate
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 360px' },
        gap: '40px',
        alignItems: 'start',
      }}
    >
      {/* Left column: the three sections. */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* 1 — Contact */}
        <Box>
          <StepHeading n={1}>Contact</StepHeading>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Field label="Full name" gridSpan>
              <TextField
                placeholder="Alex Rivera"
                fullWidth
                autoComplete="name"
                error={Boolean(errors.fullName)}
                helperText={errors.fullName?.message}
                {...register('fullName')}
              />
            </Field>
            <Field label="Email" gridSpan>
              <TextField
                placeholder="you@email.com"
                type="email"
                fullWidth
                autoComplete="email"
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                {...register('email')}
              />
            </Field>
          </Box>
        </Box>

        {/* 2 — Shipping address */}
        <Box>
          <StepHeading n={2}>Shipping address</StepHeading>
          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
            <Field label="Street address" gridSpan>
              <TextField
                placeholder="120 Linden Avenue"
                fullWidth
                autoComplete="street-address"
                error={Boolean(errors.street)}
                helperText={errors.street?.message}
                {...register('street')}
              />
            </Field>
            <Field label="City">
              <TextField
                placeholder="Portland"
                fullWidth
                autoComplete="address-level2"
                error={Boolean(errors.city)}
                helperText={errors.city?.message}
                {...register('city')}
              />
            </Field>
            <Field label="Postal code">
              <TextField
                placeholder="97201"
                fullWidth
                autoComplete="postal-code"
                error={Boolean(errors.postalCode)}
                helperText={errors.postalCode?.message}
                {...register('postalCode')}
              />
            </Field>
          </Box>
        </Box>

        {/* 3 — Payment */}
        <Box>
          <StepHeading n={3}>Payment</StepHeading>
          <Box
            sx={{
              bgcolor: emerald.tint50,
              border: '1px solid',
              borderColor: emerald.tint200,
              borderRadius: `${radii.sm}px`,
              p: '11px 14px',
              fontSize: 13,
              color: emerald.dark,
              fontWeight: 600,
              mb: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            ⚡ Test mode — use card 4242 4242 4242 4242. No real charge is made.
          </Box>

          {!intentReady ? (
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: `${radii.sm}px`,
                p: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: 'text.secondary',
                fontSize: 14,
              }}
            >
              <CircularProgress size={18} thickness={4} color="secondary" /> Preparing secure payment…
            </Box>
          ) : hasStripe ? (
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: `${radii.sm}px`,
                p: '18px',
              }}
            >
              <PaymentElement options={{ layout: 'tabs' }} />
            </Box>
          ) : (
            <Box
              sx={{
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: `${radii.sm}px`,
                p: '16px',
                fontSize: 13.5,
                color: 'text.secondary',
              }}
            >
              Mock payment mode — no card required. Your order is placed immediately for testing.
            </Box>
          )}
        </Box>
      </Box>

      {/* Right column: sticky order summary. */}
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: `${radii.lg}px`,
          p: '24px',
          position: { md: 'sticky' },
          top: 96,
        }}
      >
        <Typography
          sx={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', mb: '18px' }}
        >
          Order summary
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', mb: '18px' }}>
          {cart.items.map((c) => (
            <Box
              key={c.product.id + (c.size ?? '')}
              sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: 'text.secondary' }}
            >
              <span>
                {c.product.name} × {c.qty}
              </span>
              <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {money(c.product.price * c.qty)}
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ height: '1px', bgcolor: 'divider', mt: '6px', mb: '16px' }} />

        <SummaryRow label="Subtotal" value={money(cart.subtotal)} />
        <SummaryRow
          label="Shipping"
          value={cart.shipping === 0 ? 'Free' : money(cart.shipping)}
          valueColor={cart.shipping === 0 ? stockColors.in : undefined}
        />

        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, mt: '16px', mb: '20px' }}
        >
          <span>Total</span>
          <span>{money(cart.total)}</span>
        </Box>

        {(submitError || intentError) && (
          <Alert severity="error" sx={{ mb: '16px', borderRadius: '10px' }}>
            {submitError ?? intentError}
          </Alert>
        )}

        <Button
          type="submit"
          fullWidth
          color="secondary"
          disabled={busy || (hasStripe && (!stripe || !elements))}
          sx={{ height: 50, fontSize: 15, fontWeight: 700 }}
        >
          {busy ? 'Processing…' : `Pay ${money(cart.total)}`}
        </Button>

        <Typography sx={{ textAlign: 'center', fontSize: 12, color: 'text.disabled', mt: '12px' }}>
          🔒 Encrypted &amp; secure · Stripe test mode
        </Typography>
      </Box>
    </Box>
  );
}

/* ---- presentational helpers ---- */

function Section({ children }: { children: React.ReactNode }) {
  return (
    <Box component="section" sx={{ ...containerSx, px: 4, pt: '40px', pb: '90px' }}>
      {children}
    </Box>
  );
}

function Heading() {
  return (
    <Typography variant="h1" sx={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', mb: '30px' }}>
      Checkout
    </Typography>
  );
}

function StepHeading({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <Box
      sx={{
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        mb: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <Box
        component="span"
        sx={{
          width: 22,
          height: 22,
          borderRadius: '99px',
          bgcolor: 'text.primary',
          color: 'background.paper',
          fontSize: 12,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {n}
      </Box>
      {children}
    </Box>
  );
}

function Field({
  label,
  children,
  gridSpan,
}: {
  label: string;
  children: React.ReactNode;
  gridSpan?: boolean;
}) {
  return (
    <Box sx={gridSpan ? { gridColumn: '1 / 3' } : undefined}>
      <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: '6px', fontWeight: 500 }}>{label}</Typography>
      {children}
    </Box>
  );
}

function SummaryRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'text.secondary', mb: '12px' }}>
      <span>{label}</span>
      <Box component="span" sx={{ fontWeight: 600, color: valueColor ?? 'text.primary' }}>
        {value}
      </Box>
    </Box>
  );
}

function CheckoutSkeleton() {
  return (
    <Section>
      <Skeleton width={180} height={44} sx={{ mb: '30px' }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 360px' }, gap: '40px', alignItems: 'start' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {[0, 1, 2].map((i) => (
            <Box key={i}>
              <Skeleton width={160} height={20} sx={{ mb: '16px' }} />
              <Skeleton variant="rounded" height={46} sx={{ borderRadius: `${radii.sm}px`, mb: '14px' }} />
              <Skeleton variant="rounded" height={46} sx={{ borderRadius: `${radii.sm}px` }} />
            </Box>
          ))}
        </Box>
        <Skeleton variant="rounded" height={340} sx={{ borderRadius: `${radii.lg}px` }} />
      </Box>
    </Section>
  );
}
