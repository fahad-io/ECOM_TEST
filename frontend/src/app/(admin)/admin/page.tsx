'use client';

/**
 * Temporary admin landing. Renders the AdminShell with a single nav item so the
 * admin route group builds and the dark console chrome is visible end-to-end.
 * Real dashboard / products / orders pages (RTK Query-driven, role-guarded)
 * replace this in later modules.
 */
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import AdminShell from '@/components/AdminShell';

export default function AdminHome() {
  return (
    <AdminShell
      title="Dashboard"
      activeKey="dashboard"
      nav={[
        {
          key: 'dashboard',
          label: 'Dashboard',
          icon: <DashboardOutlinedIcon />,
          href: '/admin',
        },
      ]}
    >
      <Box>
        <Typography sx={{ fontSize: 14, color: '#6B7280' }}>
          Admin console scaffold. Dashboard, products, and orders are added in
          later modules.
        </Typography>
      </Box>
    </AdminShell>
  );
}
