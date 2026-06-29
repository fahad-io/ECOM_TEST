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
import Logo from '@/components/Logo';
import { useAppDispatch } from '@/store/hooks';
import { useAuth } from '@/store/useAuth';
import { useLoginMutation } from '@/store/authApi';
import { logout } from '@/store/authSlice';
import { normalizeApiError } from '@/store/normalizeError';

interface FormValues {
  email: string;
  password: string;
}

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

const inputSx = { '& .MuiOutlinedInput-input': { height: 48 } } as const;

/**
 * Staff sign-in (dark "ADMIN CONSOLE" screen). Uses the shared login endpoint,
 * then verifies `user.role === 'admin'`. A non-admin is immediately logged back
 * out and shown a clear "not authorised" message — admin access is never
 * granted to a regular user. On success, redirects to the console (`?from` or
 * `/admin`).
 */
export default function AdminLoginScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const dispatch = useAppDispatch();
  const { isAdmin } = useAuth();

  const [login, { isLoading }] = useLoginMutation();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const from = params.get('from');
  const dest = from && from.startsWith('/admin') ? from : '/admin';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  React.useEffect(() => {
    if (isAdmin) router.replace(dest);
  }, [isAdmin, dest, router]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const data = await login(values).unwrap();
      if (data.user.role !== 'admin') {
        // Not staff — revoke the credentials authApi just set, deny access.
        dispatch(logout());
        setServerError('This account does not have admin access.');
        return;
      }
      router.replace(dest);
    } catch (err) {
      setServerError(normalizeApiError(err as never).message);
    }
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 4,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <Box sx={{ textAlign: 'center', mb: '26px' }}>
          <Logo size={26} color="#fff" />
          <Typography
            sx={{ color: 'text.secondary', fontSize: 13, mt: '8px', letterSpacing: '0.04em' }}
          >
            ADMIN CONSOLE
          </Typography>
        </Box>

        <Box
          component="form"
          onSubmit={onSubmit}
          noValidate
          sx={{
            bgcolor: 'background.paper',
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

          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: '6px', fontWeight: 500 }}>
              Work email
            </Typography>
            <TextField
              placeholder="admin@marl.co"
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
              autoComplete="current-password"
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              sx={inputSx}
              {...register('password')}
            />
          </Box>

          <Button type="submit" size="large" fullWidth disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Sign in'}
          </Button>

          <Typography sx={{ textAlign: 'center', mt: '16px', fontSize: 12, color: 'text.disabled' }}>
            Restricted area · admin access only
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', mt: '20px' }}>
          <Link href="/" sx={{ color: 'text.secondary', fontSize: 13 }}>
            ← Back to store
          </Link>
        </Box>
      </Box>
    </Box>
  );
}
