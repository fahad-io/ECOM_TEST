'use client';

import { createTheme, type Theme, type ThemeOptions } from '@mui/material/styles';
import {
  emerald,
  storefront,
  admin,
  radii,
  focusRing,
} from './tokens';

/**
 * The MARL typeface, applied via CSS variable when wrapped in the font
 * className (see `fonts.ts` + `layout.tsx`). Falls back to system sans.
 */
const FONT_FAMILY =
  'var(--font-hanken), "Hanken Grotesk", system-ui, -apple-system, "Segoe UI", sans-serif';

/**
 * Shared typography scale + shape. The mockup uses a tight, editorial scale:
 * big 800-weight display headings with negative tracking, quiet 500/600 body.
 */
const sharedTypography: ThemeOptions['typography'] = {
  fontFamily: FONT_FAMILY,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,
  // Hero display ("Quietly considered wardrobe staples.")
  h1: { fontSize: 52, fontWeight: 800, lineHeight: 1.02, letterSpacing: '-0.02em' },
  // Page titles ("Your cart", "Checkout", "Your orders")
  h2: { fontSize: 34, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' },
  // Section heads ("You may also like")
  h3: { fontSize: 24, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.01em' },
  h4: { fontSize: 19, fontWeight: 800, letterSpacing: '-0.01em' },
  h5: { fontSize: 16, fontWeight: 700 },
  h6: { fontSize: 15, fontWeight: 700 },
  subtitle1: { fontSize: 15, fontWeight: 600 },
  subtitle2: { fontSize: 13, fontWeight: 600 },
  body1: { fontSize: 15, fontWeight: 400, lineHeight: 1.6 },
  body2: { fontSize: 14, fontWeight: 400, lineHeight: 1.6 },
  button: { fontSize: 15, fontWeight: 600, textTransform: 'none', letterSpacing: 0 },
  caption: { fontSize: 13, fontWeight: 500 },
  overline: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    lineHeight: 1.4,
  },
};

const sharedShape: ThemeOptions['shape'] = { borderRadius: radii.md };

/**
 * Component overrides shared by both themes (flat, quiet, editorial). Palette
 * differences are picked up automatically because overrides use `theme`.
 */
function sharedComponents(): ThemeOptions['components'] {
  return {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        '*': { boxSizing: 'border-box' },
        body: {
          margin: 0,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
        },
        '::selection': { background: emerald.main, color: '#fff' },
        // slim rounded scrollbars (ported from design.css)
        '::-webkit-scrollbar': { width: 10, height: 10 },
        '::-webkit-scrollbar-thumb': {
          background: theme.palette.divider,
          borderRadius: 99,
        },
        '@keyframes fadeUp': {
          from: { opacity: 0, transform: 'translateY(10px)' },
          to: { opacity: 1, transform: 'none' },
        },
        '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } },
      }),
    },
    MuiButton: {
      defaultProps: { disableElevation: true, variant: 'contained' },
      styleOverrides: {
        root: {
          borderRadius: radii.pill,
          fontWeight: 600,
          textTransform: 'none',
          paddingInline: 22,
          minHeight: 46,
          letterSpacing: 0,
        },
        sizeSmall: { minHeight: 40, paddingInline: 16, fontSize: 13 },
        sizeLarge: { minHeight: 50, fontSize: 15 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: radii.sm,
          backgroundColor: theme.palette.background.paper,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.divider,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.text.secondary,
          },
          // mockup: focus sets border to ink (no glowing ring)
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: focusRing,
            borderWidth: 1,
          },
        }),
        input: { fontSize: 14, height: 46, padding: '0 14px', boxSizing: 'border-box' },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: 13,
          fontWeight: 500,
          color: theme.palette.text.secondary,
        }),
      },
    },
    MuiSelect: {
      styleOverrides: { select: { fontSize: 14 } },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: radii.lg,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: radii.pill, fontWeight: 600, fontSize: 12.5 },
        label: { paddingInline: 12 },
      },
    },
    MuiLink: {
      defaultProps: { underline: 'none' },
      styleOverrides: { root: { cursor: 'pointer', fontWeight: 500 } },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', fullWidth: true },
    },
  };
}

/**
 * STOREFRONT theme — light, warm. Background #faf9f5, ink #111827, emerald
 * accent. Primary CTA in the mockup is actually ink-on-white ("Add to cart",
 * "Checkout"), with emerald reserved as the brand accent (dot, links, the
 * "Pay" button). We map MUI `primary` → ink so contained Buttons read as the
 * mockup's black pills, and expose emerald as `secondary`.
 */
export const storefrontTheme: Theme = createTheme({
  cssVariables: true,
  shape: sharedShape,
  typography: sharedTypography,
  palette: {
    mode: 'light',
    primary: { main: storefront.ink, contrastText: '#FFFFFF' },
    secondary: {
      main: emerald.main,
      dark: emerald.dark,
      light: emerald.tint100,
      contrastText: '#FFFFFF',
    },
    background: { default: storefront.bg, paper: storefront.surface },
    text: {
      primary: storefront.ink,
      secondary: storefront.muted3,
      disabled: storefront.faint,
    },
    divider: storefront.hairline,
    error: { main: '#DC2626' },
    success: { main: emerald.main, dark: emerald.dark },
    warning: { main: '#D97706' },
  },
  components: sharedComponents(),
});

/**
 * ADMIN theme — dark "ADMIN CONSOLE". Dark surfaces, light text, emerald
 * accent (the admin primary CTA in the mockup is the bright emerald pill with
 * deep-emerald text, e.g. "Sign in").
 */
export const adminTheme: Theme = createTheme({
  cssVariables: true,
  shape: sharedShape,
  typography: sharedTypography,
  palette: {
    mode: 'dark',
    primary: { main: emerald.main, dark: emerald.dark, contrastText: emerald.deep },
    secondary: { main: storefront.ink, contrastText: '#FFFFFF' },
    background: { default: admin.bg, paper: admin.surface2 },
    text: {
      primary: admin.text,
      secondary: admin.textMuted,
      disabled: admin.textFaint,
    },
    divider: admin.raised,
    error: { main: '#DC2626' },
    success: { main: emerald.main, dark: emerald.dark },
    warning: { main: '#D97706' },
  },
  components: {
    ...sharedComponents(),
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radii.sm,
          backgroundColor: admin.bg,
          color: admin.text,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: admin.inputBorder },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: admin.textMuted },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: emerald.main,
            borderWidth: 1,
          },
        },
        input: { fontSize: 14, height: 46, padding: '0 14px', boxSizing: 'border-box' },
      },
    },
  },
});

export type { Theme };
