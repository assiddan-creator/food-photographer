export const LUNCH_MIN_DISHES = 3;
export const LUNCH_MAX_DISHES = 5;
export const LUNCH_SEND_HINT = 'מומלץ לשלוח ~10:30';

export function lunchDishLabel(name: string | undefined, index: number): string {
  const trimmed = name?.trim();
  return trimmed || `מנה ${index + 1}`;
}

/** Keep a typed ₪52; don't double-prefix if the owner already wrote ₪. */
export function formatLunchPrice(raw: string | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  if (/[₪$€]/.test(trimmed) || /^ils\b/i.test(trimmed)) return trimmed;
  return `₪${trimmed}`;
}

export function formatLunchListLine(
  name: string | undefined,
  price: string | undefined,
  index: number,
): string {
  const label = lunchDishLabel(name, index);
  const formatted = formatLunchPrice(price);
  return formatted ? `• ${label} — ${formatted}` : `• ${label}`;
}

/**
 * Warm office-group WhatsApp copy. Prices sit beside names when set.
 * No Ten Bis / Wolt, no heavy sales push. 10:30 is owner guidance, not in the body.
 */
export function buildLunchWhatsAppText(options: {
  businessName?: string;
  dishes: Array<{ name?: string; price?: string }>;
}): string {
  const name = options.businessName?.trim();
  const greeting = name ? `צהריים טובים מ${name} 🍽️` : 'צהריים טובים 🍽️';
  const dishes = options.dishes.length > 0 ? options.dishes : [{}];
  const list = dishes.map((dish, index) => formatLunchListLine(dish.name, dish.price, index));

  return [
    greeting,
    'היום אצלנו:',
    '',
    ...list,
    '',
    'הזמנה ישירה או איסוף — השיבו להודעה.',
    'בתיאבון!',
  ].join('\n');
}
