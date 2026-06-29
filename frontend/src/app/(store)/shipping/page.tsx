import type { Metadata } from 'next';
import InfoPage from '@/components/InfoPage';

export const metadata: Metadata = { title: 'Shipping — MARL.' };

export default function ShippingPage() {
  return (
    <InfoPage
      eyebrow="Shipping"
      title="Considered delivery."
      paragraphs={[
        'Complimentary shipping on orders over $150. Below that, a flat $12 rate applies — calculated for you at checkout, never a surprise.',
        'Orders are packed and dispatched within 1–2 business days. You’ll get a confirmation when your order ships and again when it’s on its way.',
        'Everything is sent in minimal, recyclable packaging — considered essentials, made to last, delivered the same way.',
      ]}
    />
  );
}
