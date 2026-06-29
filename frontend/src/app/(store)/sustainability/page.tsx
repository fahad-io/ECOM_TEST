import type { Metadata } from 'next';
import InfoPage from '@/components/InfoPage';

export const metadata: Metadata = { title: 'Sustainability — MARL.' };

export default function SustainabilityPage() {
  return (
    <InfoPage
      eyebrow="Sustainability"
      title="Natural fibres, honest construction."
      paragraphs={[
        'We design for longevity, not for the season. Fewer, better pieces in natural fibres — organic cotton, extra-fine merino, lambswool — chosen to wear in rather than out.',
        'Garments are made in small runs with mills and makers we know, so we can stand behind how each piece is built and how long it lasts.',
        'A palette that does the thinking for you means a wardrobe that works for years — the quietest form of sustainability we know.',
      ]}
    />
  );
}
