import {
  LOYALTY_PERCENT,
  defaultLoyaltyKind,
  envGoogleReviewUrl,
  type LoyaltyKind,
} from '@/lib/restaurant-settings';

export function getGoogleReviewUrl(): string | null {
  return envGoogleReviewUrl() || null;
}

export type WhatsAppTemplateId = 'ready' | 'promo' | 'next' | 'google';

export const WHATSAPP_TEMPLATE_CHIPS: { id: WhatsAppTemplateId; label: string }[] = [
  { id: 'ready', label: 'המנה מוכנה' },
  { id: 'promo', label: 'מבצע היום' },
  { id: 'next', label: 'לפעם הבאה' },
  { id: 'google', label: 'דירוג בגוגל' },
];

export const LOYALTY_CHIPS: { id: LoyaltyKind; label: string }[] = [
  { id: 'first', label: `הזמנה ראשונה · ${LOYALTY_PERCENT.first}%` },
  { id: 'returning', label: `לקוח חוזר · ${LOYALTY_PERCENT.returning}%` },
];

export function buildLoyaltyPromoMessage(kind: LoyaltyKind): string {
  const percent = LOYALTY_PERCENT[kind];
  if (kind === 'first') {
    return `הזמנה ישירה ראשונה — ${percent}% הנחה. מזמינים אצלנו, בלי אפליקציה.`;
  }
  return `שמחים שחזרת! ${percent}% הנחה בהזמנה ישירה.`;
}

export function buildLoyaltyNextMessage(
  kind: LoyaltyKind,
  dishName?: string,
  customText?: string,
): string {
  const dish = dishName?.trim();
  const custom = customText?.trim();
  if (custom) {
    return dish ? `${custom}${/[.!?…]$/.test(custom) ? ' ' : '. '}כדאי לנסות גם את ה${dish}.` : custom;
  }
  const percent = LOYALTY_PERCENT[kind];
  const offer =
    kind === 'first'
      ? `בפעם הבאה — ${percent}% הנחה בהזמנה ישירה הראשונה`
      : `לקוחות חוזרים מקבלים ${percent}% בהזמנה ישירה`;
  return dish ? `${offer}. כדאי לנסות גם את ה${dish}.` : `${offer}.`;
}

function withBusinessSignOff(body: string, businessName?: string): string {
  const name = businessName?.trim();
  return name ? `${body}\n— ${name}` : body;
}

/** Neutral review request + link only. Never mention a discount (Google policy). */
export function buildGoogleReviewMessage(reviewUrl?: string | null): string {
  const url = reviewUrl?.trim();
  return url
    ? `אם נהנית, נשמח לביקורת בגוגל 🙏\n${url}`
    : 'אם נהנית, נשמח לביקורת בגוגל 🙏';
}

export function buildWhatsAppMessage(options: {
  templateId: WhatsAppTemplateId;
  dishName?: string;
  loyaltyKind?: LoyaltyKind;
  reviewUrl?: string | null;
  businessName?: string;
  nextVisitText?: string;
}): string {
  const loyaltyKind =
    options.loyaltyKind ??
    (options.templateId === 'promo' || options.templateId === 'next'
      ? defaultLoyaltyKind(options.templateId)
      : 'first');
  const name = options.businessName?.trim();

  switch (options.templateId) {
    case 'ready':
      return name
        ? `היי! המנה שלך מוכנה 🍽️ נשמח שתהנו אצל ${name} — אפשר לאסוף / אנחנו בדרך.`
        : 'היי! המנה שלך מוכנה 🍽️ נשמח שתהנו — אפשר לאסוף / אנחנו בדרך.';
    case 'promo':
      return withBusinessSignOff(buildLoyaltyPromoMessage(loyaltyKind), name);
    case 'next':
      return withBusinessSignOff(
        buildLoyaltyNextMessage(loyaltyKind, options.dishName, options.nextVisitText),
        name,
      );
    case 'google':
      return buildGoogleReviewMessage(options.reviewUrl);
  }
}

export type SocialCaptionId = 'kitchen' | 'grill' | 'new' | 'fresh' | 'storyNow' | 'storyKitchen';

export function getSocialCaptionChips(isStory: boolean): { id: SocialCaptionId; label: string }[] {
  if (isStory) {
    return [
      { id: 'storyNow', label: 'סטורי עכשיו' },
      { id: 'storyKitchen', label: 'מהמטבח' },
      { id: 'kitchen', label: 'היום במטבח' },
      { id: 'fresh', label: 'טרי' },
    ];
  }
  return [
    { id: 'kitchen', label: 'היום במטבח' },
    { id: 'grill', label: 'מהגריל' },
    { id: 'new', label: 'חדש בתפריט' },
    { id: 'fresh', label: 'טרי מהמטבח' },
  ];
}

export function buildSocialCaption(options: {
  captionId: SocialCaptionId;
  dishName?: string;
}): string {
  const dish = options.dishName?.trim();
  switch (options.captionId) {
    case 'kitchen':
      return dish
        ? `היום במטבח 🔥 ${dish} — רק מהטלפון. תגיעו / הזמינו משלוח. #אוכל #מסעדה`
        : 'היום במטבח 🔥 מנה שנראית כמו שהיא במסעדה — רק מהטלפון. תגיעו / הזמינו משלוח. #אוכל #מסעדה';
    case 'grill':
      return dish ? `היום מהגריל · ${dish}` : 'היום מהגריל';
    case 'new':
      return dish ? `חדש בתפריט · ${dish}` : 'חדש בתפריט';
    case 'fresh':
      return 'טרי מהמטבח — מחכים לכם';
    case 'storyNow':
      return dish ? `עולה עכשיו לסטורי · ${dish}` : 'עולה עכשיו לסטורי';
    case 'storyKitchen':
      return dish ? `סטורי מהמטבח · ${dish}` : 'סטורי מהמטבח 🔥';
  }
}
