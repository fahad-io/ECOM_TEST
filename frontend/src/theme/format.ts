/**
 * Presentational formatting helpers, ported from the mockup's logic so the
 * design system is the single owner of these visual rules too.
 */
import { stock as stockColors } from './tokens';

/** `$1,234` — integer USD, matches `money()` in the mockup. */
export function money(n: number): string {
  return '$' + Number(n || 0).toLocaleString('en-US');
}

/** Up-to-two-letter monogram from a name, e.g. "Merino Crew Knit" -> "MC". */
export function mono(name: string): string {
  return (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

/** Stock dot/text color: sold out (grey), low <=5 (amber), else emerald. */
export function stockColor(n: number): string {
  return n <= 0 ? stockColors.out : n <= 5 ? stockColors.low : stockColors.in;
}

/** Stock label: "Sold out" | "Only N left" | "In stock". */
export function stockLabel(n: number): string {
  return n <= 0 ? 'Sold out' : n <= 5 ? `Only ${n} left` : 'In stock';
}

/** Short, human-friendly order id, e.g. `#A1B2C3` from a Mongo ObjectId. */
export function shortOrderId(id: string): string {
  return '#' + (id || '').slice(-6).toUpperCase();
}

/** `Jun 29, 2026` — date label used on order cards / detail. */
export function orderDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
