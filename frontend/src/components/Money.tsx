import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import { money } from '@/theme/format';

export interface MoneyProps {
  /** Integer USD amount. */
  value: number;
  sx?: SxProps<Theme>;
  component?: React.ElementType;
}

/**
 * Renders a formatted USD amount (`$1,234`). Thin wrapper over the `money()`
 * formatter so consumers don't re-derive currency formatting.
 */
export default function Money({ value, sx, component = 'span' }: MoneyProps) {
  return (
    <Box component={component} sx={sx}>
      {money(value)}
    </Box>
  );
}
