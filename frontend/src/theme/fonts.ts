import { Hanken_Grotesk } from 'next/font/google';

/**
 * Hanken Grotesk — the MARL typeface. Weights 400–800 per the design.
 * Exposes a CSS variable so the MUI theme and global CSS can reference it.
 */
export const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-hanken',
});
