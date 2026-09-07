export const CUSTOMER_SHARE_TEXT = 'היי, הנה תמונת המנה המוכנה 🍽️';

function buildWhatsAppHref(text: string, raw = process.env.NEXT_PUBLIC_WHATSAPP): string {
  const encoded = encodeURIComponent(text);
  const value = raw?.trim();

  if (!value) {
    return `https://wa.me/?text=${encoded}`;
  }

  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      if (!url.searchParams.has('text')) {
        url.searchParams.set('text', text);
      }
      return url.toString();
    } catch {
      return value;
    }
  }

  const digits = value.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
}

/**
 * Build a WhatsApp lead link from NEXT_PUBLIC_WHATSAPP.
 * Accepts a full URL, or a phone number (digits / + / spaces).
 * When unset, returns a generic wa.me share stub so the CTA still works.
 */
export function getWhatsAppHref(raw = process.env.NEXT_PUBLIC_WHATSAPP): string {
  return buildWhatsAppHref(
    'היי, אני בעל/ת מסעדה ומעוניין/ת בצלם מנות AI (Assi & Johnny Photobooth).',
    raw,
  );
}

/** Kitchen "send this dish to a customer" — Web Share fallback. */
export function getCustomerWhatsAppHref(raw = process.env.NEXT_PUBLIC_WHATSAPP): string {
  return buildWhatsAppHref(CUSTOMER_SHARE_TEXT, raw);
}
