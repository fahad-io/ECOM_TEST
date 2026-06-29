'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import { radii } from '@/theme/tokens';

export interface EmptyStateProps {
  /** Optional icon/glyph rendered above the title. */
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  /** Primary action label. */
  actionLabel?: string;
  onAction?: () => void;
  /**
   * `button` renders an ink pill (e.g. cart "Continue shopping").
   * `link` renders an emerald text link (e.g. catalog "Reset all filters").
   */
  actionVariant?: 'button' | 'link';
  /** Dashed bordered card (mockup style) vs bare. Default true. */
  dashed?: boolean;
}

/**
 * Empty / no-results state: optional icon, title, subtitle, and an action.
 * Matches the mockup's dashed-border placeholders ("No pieces match your
 * filters", "Your cart is empty").
 */
export default function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  actionVariant = 'button',
  dashed = true,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: '80px',
        px: '20px',
        borderRadius: `${radii.lg}px`,
        ...(dashed && { border: '1px dashed', borderColor: 'divider' }),
      }}
    >
      {icon && (
        <Box sx={{ color: 'text.disabled', mb: 2, '& svg': { fontSize: 40 } }}>{icon}</Box>
      )}
      <Typography sx={{ fontSize: 18, fontWeight: 700, color: 'text.primary', mb: '6px' }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ fontSize: 14, color: 'text.disabled', mb: actionLabel ? '18px' : 0 }}>
          {subtitle}
        </Typography>
      )}
      {actionLabel &&
        (actionVariant === 'button' ? (
          <Button onClick={onAction}>{actionLabel}</Button>
        ) : (
          <Link onClick={onAction} sx={{ color: 'secondary.main', fontWeight: 600 }}>
            {actionLabel}
          </Link>
        ))}
    </Box>
  );
}
