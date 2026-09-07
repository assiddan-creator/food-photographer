/**
 * Build a WhatsApp lead link from NEXT_PUBLIC_WHATSAPP.
 * Accepts a full URL, or a phone number (digits / + / spaces).
 * When unset, returns a generic wa.me share stub so the CTA still works.
 */
export function getWhatsAppHref(raw = process.env.NEXT_PUBLIC_WHATSAPP): string {
  const presetText =
    'היי, אני בעל/ת מסעדה ומעוניין/ת בצלם מנות AI (Assi & Johnny Photobooth).';
  const encoded = encodeURIComponent(presetText);
  const value = raw?.trim();

  if (!value) {
    return `https://wa.me/?text=${encoded}`;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const digits = value.replace(/\D/g, '');
  return digits
    ? `https://wa.me/${digits}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
}
