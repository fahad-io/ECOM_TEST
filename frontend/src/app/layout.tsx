import type { Metadata } from 'next';
import './globals.css';
import { hankenGrotesk } from '@/theme/fonts';
import ThemeRegistry from '@/theme/ThemeRegistry';

export const metadata: Metadata = {
  title: 'MARL.',
  description: 'Quietly considered wardrobe staples.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={hankenGrotesk.variable}>
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
