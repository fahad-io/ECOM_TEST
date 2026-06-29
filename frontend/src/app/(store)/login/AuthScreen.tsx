'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import { useAppDispatch } from '@/store/hooks';
import { useAuth } from '@/store/useAuth';
import {
  useLoginMutation,
  useSignupMutation,
  type AuthResponse,
} from '@/store/authApi';
import { normalizeApiError } from '@/store/normalizeError';

interface FormValues {
  name: string;
  email: string;
  password: string;
}

/** Server DTO rules mirrored: name >= 2, valid email, password >= 8. */
const buildSchema = (isSignup: boolean) =>
  yup.object({
    name: isSignup
      ? yup.string().trim().min(2, 'Name must be at least 2 characters').required('Name is required')
      : yup.string().notRequired().default(''),
    email: yup.string().email('Enter a valid email').required('Email is required'),
    password: yup
      .string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
  });

const inputSx = {
  '& .MuiOutlinedInput-input': { height: 48 },
} as const;

export interface AuthScreenProps {
  /** `signup` renders the create-account variant; `login` (default) the sign-in. */
  mode?: 'login' | 'signup';
}

/**
 * Customer login / signup screen (matches the mockup's auth card). RHF + Yup
 * with field-level errors, a disabled submit while pending, and the normalised
 * error envelope surfaced above the form. On success the auth slice is
 * populated (via authApi `onQueryStarted`) and we redirect back to `?from` or
 * the catalog.
 */
export default function AuthScreen({ mode = 'login' }: AuthScreenProps) {
  const router = useRouter();
  const params = useSearchParams();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const isSignup = mode === 'signup';

  const [login, loginState] = useLoginMutation();
  const [signup, signupState] = useSignupMutation();
  const pending = loginState.isLoading || signupState.isLoading;

  const from = params.get('from');
  const switchHref = isSignup ? '/login' : '/signup';
  // Preserve the `from` redirect target across the login <-> signup toggle.
  const switchTo = from ? `${switchHref}?from=${encodeURIComponent(from)}` : switchHref;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(buildSchema(isSignup)) as never,
    defaultValues: { name: '', email: '', password: '' },
    mode: 'onTouched',
  });

  const [serverError, setServerError] = React.useState<string | null>(null);

  // Already signed in: bounce away from the auth screen.
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace(from && from.startsWith('/') ? from : '/');
    }
  }, [isAuthenticated, from, router]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const action = isSignup
        ? signup({ name: values.name.trim(), email: values.email, password: values.password })
        : login({ email: values.email, password: values.password });
      const data: AuthResponse = await action.unwrap();
      const dest = from && from.startsWith('/') ? from : '/';
      router.replace(dest);
      // setCredentials already dispatched inside authApi; nothing else needed.
      void data;
      void dispatch;
    } catch (err) {
      setServerError(normalizeApiError(err as never).message);
    }
  });

  return (
    <Box
      component="section"
      sx={{ maxWidth: 440, mx: 'auto', px: 4, pt: '56px', pb: '90px' }}
    >
      <Box sx={{ textAlign: 'center', mb: '28px' }}>
        <Typography variant="h2" sx={{ fontSize: 30, mb: '8px' }}>
          {isSignup ? 'Create your account' : 'Welcome back'}
        </Typography>
        <Typography sx={{ color: 'text.disabled', fontSize: 14 }}>
          {isSignup
            ? 'Join MARL. to track orders and save your cart.'
            : 'Sign in to your account.'}
        </Typography>
      </Box>

      <Box
        component="form"
        onSubmit={onSubmit}
        noValidate
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '18px',
          p: '28px',
        }}
      >
        {serverError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
            {serverError}
          </Alert>
        )}

        {isSignup && (
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: '6px', fontWeight: 500 }}>
              Full name
            </Typography>
            <TextField
              placeholder="Alex Rivera"
              fullWidth
              autoComplete="name"
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              sx={inputSx}
              {...register('name')}
            />
          </Box>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: '6px', fontWeight: 500 }}>
            Email
          </Typography>
          <TextField
            placeholder="you@email.com"
            type="email"
            fullWidth
            autoComplete="email"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            sx={inputSx}
            {...register('email')}
          />
        </Box>

        <Box sx={{ mb: '22px' }}>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: '6px', fontWeight: 500 }}>
            Password
          </Typography>
          <TextField
            type="password"
            fullWidth
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            sx={inputSx}
            {...register('password')}
          />
        </Box>

        <Button type="submit" size="large" fullWidth disabled={pending}>
          {pending
            ? isSignup
              ? 'Creating account…'
              : 'Signing in…'
            : isSignup
              ? 'Create account'
              : 'Sign in'}
        </Button>

        <Typography sx={{ textAlign: 'center', mt: '18px', fontSize: 13.5, color: 'text.secondary' }}>
          {isSignup ? 'Already have an account?' : 'New to MARL.?'}{' '}
          <Link href={switchTo} sx={{ color: 'secondary.main', fontWeight: 700 }}>
            {isSignup ? 'Sign in' : 'Create one'}
          </Link>
        </Typography>
      </Box>

      <Typography sx={{ textAlign: 'center', mt: '22px', fontSize: 13, color: 'text.disabled' }}>
        Looking for the admin panel?{' '}
        <Link href="/admin/login" sx={{ color: 'text.primary', fontWeight: 600 }}>
          Staff sign in
        </Link>
      </Typography>
    </Box>
  );
}
