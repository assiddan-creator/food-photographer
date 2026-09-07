import {
  DEFAULT_FIRST_CUSTOMER_TEXT,
  DEFAULT_RETURNING_CUSTOMER_TEXT,
  LOYALTY_PERCENT,
  defaultLoyaltyKind,
  envGoogleReviewUrl,
  type LoyaltyKind,
} from '@/lib/restaurant-settings';

export function getGoogleReviewUrl(): string | null {
  return envGoogleReviewUrl() || null;
}

export type WhatsAppTemplateId = 'ready' | 'promo' | 'next' | 'bridge' | 'google';

export const WHATSAPP_TEMPLATE_CHIPS: { id: WhatsAppTemplateId; label: string }[] = [
  { id: 'ready', label: 'המנה מוכנה' },
  { id: 'promo', label: 'מבצע היום' },
  { id: 'next', label: 'לפעם הבאה' },
  { id: 'bridge', label: 'הזמנה ישירה · הטבה' },
  { id: 'google', label: 'דירוג בגוגל' },
];

/** Owner helper — never sent to the customer. Complements «לפעם הבאה»; never bash apps. */
export const LOYALTY_BRIDGE_OWNER_HINT =
  "צ'יפ זהב חדש · לא מחליף את «לפעם הבאה» · משלים אותו. בלי «עזוב תן-ביס/וולט» — הזמנה ישירה + הטבה.";

export const BRIDGE_LOYALTY_CHIPS: { id: LoyaltyKind; label: string }[] = [
  { id: 'first', label: `ראשון ${LOYALTY_PERCENT.first}%` },
  { id: 'returning', label: `חוזר ${LOYALTY_PERCENT.returning}%` },
];

export const LOYALTY_CHIPS: { id: LoyaltyKind; label: string }[] = [
  { id: 'first', label: `לקוח ראשון · ${LOYALTY_PERCENT.first}%` },
  { id: 'returning', label: `לקוח חוזר · ${LOYALTY_PERCENT.returning}%` },
];

export function defaultLoyaltyCopy(kind: LoyaltyKind): string {
  return kind === 'first' ? DEFAULT_FIRST_CUSTOMER_TEXT : DEFAULT_RETURNING_CUSTOMER_TEXT;
}

export function buildLoyaltyCopy(kind: LoyaltyKind, customText?: string): string {
  return customText?.trim() || defaultLoyaltyCopy(kind);
}

export function buildLoyaltyPromoMessage(kind: LoyaltyKind, customText?: string): string {
  return buildLoyaltyCopy(kind, customText);
}

export function buildLoyaltyNextMessage(
  kind: LoyaltyKind,
  dishName?: string,
  customText?: string,
): string {
  const body = buildLoyaltyCopy(kind, customText);
  const dish = dishName?.trim();
  if (!dish) return body;
  return `${body}${/[.!?…]$/.test(body) ? ' ' : '. '}כדאי לנסות גם את ה${dish}.`;
}

export function loyaltyBridgeBadge(kind: LoyaltyKind): string {
  return kind === 'first'
    ? `לקוח ראשון · ${LOYALTY_PERCENT.first}% קבוע`
    : `לקוח חוזר · ${LOYALTY_PERCENT.returning}% קבוע`;
}

function defaultBridgeCopy(kind: LoyaltyKind): string {
  if (kind === 'first') {
    return [
      '🙌 שמחים להכיר',
      `הזמנה ראשונה ישירה מאיתנו — ${LOYALTY_PERCENT.first}% עלינו.`,
      'רק לכתוב «אני» ונשלח פרטים.',
    ].join('\n');
  }
  return [
    'כיף שחזרתם 💛',
    `לחברים של הבית — ${LOYALTY_PERCENT.returning}% על הזמנה ישירה.`,
    'נשמח לשלוח תפריט / לינק מהיר.',
  ].join('\n');
}

/**
 * Soft deliveries → direct loyalty. Never bash Ten Bis / Wolt and never mention a Google review.
 * Optional restaurant-settings copy replaces the default body when set.
 */
export function buildLoyaltyBridgeMessage(kind: LoyaltyKind, customText?: string): string {
  return customText?.trim() || defaultBridgeCopy(kind);
}

export function templateUsesLoyaltyToggle(templateId: WhatsAppTemplateId): boolean {
  return templateId === 'promo' || templateId === 'next' || templateId === 'bridge';
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
  firstCustomerText?: string;
  returningCustomerText?: string;
}): string {
  const loyaltyKind =
    options.loyaltyKind ??
    (options.templateId === 'promo' ||
    options.templateId === 'next' ||
    options.templateId === 'bridge'
      ? defaultLoyaltyKind(options.templateId)
      : 'first');
  const name = options.businessName?.trim();
  const customText =
    loyaltyKind === 'first' ? options.firstCustomerText : options.returningCustomerText;

  switch (options.templateId) {
    case 'ready':
      return name
        ? `היי! המנה שלך מוכנה 🍽️ נשמח שתהנו אצל ${name} — אפשר לאסוף / אנחנו בדרך.`
        : 'היי! המנה שלך מוכנה 🍽️ נשמח שתהנו — אפשר לאסוף / אנחנו בדרך.';
    case 'promo':
      return withBusinessSignOff(buildLoyaltyPromoMessage(loyaltyKind, customText), name);
    case 'next':
      return withBusinessSignOff(
        buildLoyaltyNextMessage(loyaltyKind, options.dishName, customText),
        name,
      );
    case 'bridge':
      return withBusinessSignOff(buildLoyaltyBridgeMessage(loyaltyKind, customText), name);
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
