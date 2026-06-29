import type { Metadata } from 'next';
import './globals.css';
import { hankenGrotesk } from '@/theme/fonts';
import StoreProvider from '@/store/StoreProvider';

export const metadata: Metadata = {
  title: 'MARL.',
  description: 'Quietly considered wardrobe staples.',
};

/**
 * Root layout: owns <html>, the brand font, and the Redux store. The MUI theme
 * is applied per route group ((store) = storefront light, (admin) = admin dark)
 * so each group can pick its palette while sharing one store.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={hankenGrotesk.variable}>
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
