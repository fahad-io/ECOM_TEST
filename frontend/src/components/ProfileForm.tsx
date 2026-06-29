'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import { useUpdateProfileMutation } from '@/store/authApi';
import { useAppDispatch } from '@/store/hooks';
import { useAuth } from '@/store/useAuth';
import { setCredentials } from '@/store/authSlice';
import { normalizeApiError } from '@/store/normalizeError';
import { productImageUrl } from '@/lib/imageUrl';
import { mono } from '@/theme/format';

interface FormValues {
  name: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const schema: yup.ObjectSchema<FormValues> = yup.object({
  name: yup.string().trim().min(2, 'Name must be at least 2 characters').max(80, 'Name is too long').required('Name is required'),
  newPassword: yup
    .string()
    .default('')
    .test('len', 'Password must be at least 8 characters', (v) => !v || v.length >= 8),
  currentPassword: yup.string().default('').when('newPassword', {
    is: (v: string) => Boolean(v),
    then: (s) => s.required('Enter your current password'),
  }),
  confirmNewPassword: yup.string().default('').when('newPassword', {
    is: (v: string) => Boolean(v),
    then: (s) => s.oneOf([yup.ref('newPassword')], 'Passwords do not match').required('Re-type the new password'),
  }),
});

const labelSx = { fontSize: 13, color: '#6B7280', mb: '6px', fontWeight: 500 } as const;

// Force a light field regardless of theme — this form renders on a white card
// in both the storefront (light theme) and the admin (dark theme) console.
const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    bgcolor: '#fff',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D1D5DB' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#111827' },
    '&.Mui-disabled': { bgcolor: '#F9FAFB' },
  },
  '& .MuiOutlinedInput-input': { color: '#111827' },
  '& .MuiOutlinedInput-input::placeholder': { color: '#9CA3AF', opacity: 1 },
  '& .MuiOutlinedInput-input.Mui-disabled': { WebkitTextFillColor: '#6B7280' },
} as const;

/**
 * Shared profile editor (customer + admin): change display name, profile
 * picture, and password. On success the store's user is refreshed so the nav /
 * avatar update immediately. Email is shown read-only (not editable here).
 */
export default function ProfileForm() {
  const dispatch = useAppDispatch();
  const { user, token } = useAuth();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const [serverError, setServerError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(
    productImageUrl(user?.avatarPath) ?? null,
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: 'onTouched',
    defaultValues: { name: user?.name ?? '', currentPassword: '', newPassword: '', confirmNewPassword: '' },
  });

  const pickFile = (file: File | undefined | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setServerError('Please choose a PNG or JPG image.');
      return;
    }
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
    setServerError(null);
  };

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setSuccess(null);
    const fd = new FormData();
    fd.append('name', values.name.trim());
    if (values.newPassword) {
      fd.append('currentPassword', values.currentPassword);
      fd.append('newPassword', values.newPassword);
    }
    if (avatarFile) fd.append('avatar', avatarFile);

    try {
      const updated = await updateProfile(fd).unwrap();
      if (token) dispatch(setCredentials({ token, user: updated }));
      setAvatarFile(null);
      reset({ name: updated.name, currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setSuccess('Profile updated.');
    } catch (err) {
      setServerError(normalizeApiError(err as never).message);
    }
  });

  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      noValidate
      sx={{ width: '100%', bgcolor: '#fff', border: '1px solid #ECECEC', borderRadius: '16px', p: { xs: '24px', md: '32px' } }}
    >
      {success && <Alert severity="success" sx={{ mb: '20px', borderRadius: '10px' }}>{success}</Alert>}
      {serverError && <Alert severity="error" sx={{ mb: '20px', borderRadius: '10px' }}>{serverError}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, columnGap: '56px' }}>
        {/* left column: account details */}
        <Box>
      {/* avatar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '18px', mb: '26px' }}>
        <Box
          onClick={() => fileInputRef.current?.click()}
          sx={{
            width: 76,
            height: 76,
            borderRadius: '99px',
            flex: '0 0 auto',
            bgcolor: '#ECFDF5',
            color: '#047857',
            border: '1px solid #D1FAE5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            fontWeight: 800,
            overflow: 'hidden',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          {preview ? (
            <Box component="img" src={preview} alt="" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            mono(user?.name ?? '')
          )}
        </Box>
        <Box>
          <Button
            type="button"
            variant="outlined"
            onClick={() => fileInputRef.current?.click()}
            sx={{
              height: 38,
              px: '16px',
              bgcolor: '#fff',
              color: '#111827',
              borderColor: '#E5E7EB',
              borderRadius: '99px',
              fontSize: 13.5,
              fontWeight: 600,
              '&:hover': { borderColor: '#D1D5DB', bgcolor: '#FAFAF9' },
            }}
          >
            Change photo
          </Button>
          {preview && (
            <Link
              component="button"
              type="button"
              onClick={() => {
                if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
                setAvatarFile(null);
                setPreview(null);
              }}
              sx={{ display: 'block', fontSize: 12.5, color: '#6B7280', mt: '8px' }}
            >
              Remove photo
            </Link>
          )}
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" hidden onChange={(e) => pickFile(e.target.files?.[0])} />
        </Box>
      </Box>

      {/* name + email */}
      <Box sx={{ mb: '16px' }}>
        <Typography sx={labelSx}>Name</Typography>
        <TextField fullWidth error={Boolean(errors.name)} helperText={errors.name?.message} sx={fieldSx} {...register('name')} />
      </Box>
      <Box sx={{ mb: { xs: '24px', md: 0 } }}>
        <Typography sx={labelSx}>Email</Typography>
        <TextField fullWidth value={user?.email ?? ''} disabled sx={fieldSx} />
      </Box>
        </Box>

        {/* right column: change password */}
        <Box>
      <Typography sx={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#9CA3AF', mb: '14px' }}>
        Change password
      </Typography>
      <Box sx={{ mb: '16px' }}>
        <Typography sx={labelSx}>Current password</Typography>
        <TextField type="password" fullWidth autoComplete="current-password" error={Boolean(errors.currentPassword)} helperText={errors.currentPassword?.message} sx={fieldSx} {...register('currentPassword')} />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: '14px' }}>
        <Box>
          <Typography sx={labelSx}>New password</Typography>
          <TextField type="password" fullWidth autoComplete="new-password" error={Boolean(errors.newPassword)} helperText={errors.newPassword?.message} sx={fieldSx} {...register('newPassword')} />
        </Box>
        <Box>
          <Typography sx={labelSx}>Confirm new password</Typography>
          <TextField type="password" fullWidth autoComplete="new-password" error={Boolean(errors.confirmNewPassword)} helperText={errors.confirmNewPassword?.message} sx={fieldSx} {...register('confirmNewPassword')} />
        </Box>
      </Box>
        </Box>
      </Box>

      <Box sx={{ mt: '28px', pt: '24px', borderTop: '1px solid #F4F4F2' }}>
        <Button
          type="submit"
          disabled={isLoading}
          sx={{ height: 46, px: '24px', bgcolor: '#111827', color: '#fff', borderRadius: '99px', fontSize: 14, fontWeight: 600, '&:hover': { bgcolor: '#000' } }}
        >
          {isLoading ? 'Saving…' : 'Save changes'}
        </Button>
      </Box>
    </Box>
  );
}
