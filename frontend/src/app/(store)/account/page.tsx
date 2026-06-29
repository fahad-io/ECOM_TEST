'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import RequireAuth from '@/components/RequireAuth';
import ProfileForm from '@/components/ProfileForm';

/** Customer profile page (`/account`). Edit name, password, profile picture. */
export default function AccountPage() {
  return (
    <RequireAuth>
      <Box component="section" sx={{ maxWidth: 1240, mx: 'auto', px: 4, pt: '48px', pb: '90px' }}>
        <Typography variant="h1" sx={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', mb: '6px' }}>
          Your profile
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 15, mb: '30px' }}>
          Manage your name, photo, and password.
        </Typography>
        <ProfileForm />
      </Box>
    </RequireAuth>
  );
}
