import type { Metadata } from 'next';
import InfoPage from '@/components/InfoPage';

export const metadata: Metadata = { title: 'Contact — MARL.' };

export default function ContactPage() {
  return (
    <InfoPage
      eyebrow="Contact"
      title="We’re here to help."
      paragraphs={[
        'Questions about an order, a size, or a return? Email us at hello@marl.test and we’ll get back to you within one business day.',
        'For anything about your account or order status, you’ll find the details under “Your orders” when you’re signed in.',
        'MARL. — quietly considered wardrobe staples.',
      ]}
    />
  );
}
