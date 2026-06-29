import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import { ORDER_STATUS, radii, type OrderStatus } from '@/theme/tokens';

export interface StatusChipProps {
  /** Order status (lowercase, matches the API contract). */
  status: OrderStatus;
  sx?: SxProps<Theme>;
}

/**
 * Order-status chip: colored dot + label on a tinted pill, using the canonical
 * status → {label,color,bg} map. The single owner of status visuals.
 */
export default function StatusChip({ status, sx }: StatusChipProps) {
  const meta = ORDER_STATUS[status] ?? ORDER_STATUS.pending;
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        bgcolor: meta.bg,
        color: meta.color,
        px: '13px',
        py: '6px',
        borderRadius: `${radii.pill}px`,
        fontSize: 12.5,
        fontWeight: 700,
        ...sx,
      }}
    >
      <Box
        component="span"
        aria-hidden
        sx={{ width: 6, height: 6, borderRadius: '99px', bgcolor: meta.color }}
      />
      {meta.label}
    </Box>
  );
}
