import type { Metadata } from 'next';
import InfoPage from '@/components/InfoPage';

export const metadata: Metadata = { title: 'Returns — MARL.' };

export default function ReturnsPage() {
  return (
    <InfoPage
      eyebrow="Returns"
      title="Free returns within 30 days."
      paragraphs={[
        'If a piece isn’t right, return it within 30 days of delivery for a full refund. Items should be unworn, with their original tags.',
        'Start a return from your order in “Your orders” — we’ll send a prepaid label and refund to your original payment method once it arrives back with us.',
        'Questions about a specific piece? Reach us any time and we’ll help you find the right fit.',
      ]}
    />
  );
}
