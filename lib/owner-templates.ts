export function getGoogleReviewUrl(): string | null {
  const value = process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL?.trim();
  return value || null;
}

export type WhatsAppTemplateId = 'ready' | 'promo' | 'next' | 'google';

export const WHATSAPP_TEMPLATE_CHIPS: { id: WhatsAppTemplateId; label: string }[] = [
  { id: 'ready', label: 'המנה מוכנה' },
  { id: 'promo', label: 'מבצע היום' },
  { id: 'next', label: 'לפעם הבאה' },
  { id: 'google', label: 'דירוג בגוגל' },
];

export function buildWhatsAppMessage(options: {
  templateId: WhatsAppTemplateId;
  dishName?: string;
  promoText?: string;
  reviewUrl?: string | null;
}): string {
  const dish = options.dishName?.trim();
  const promo = options.promoText?.trim();
  const reviewUrl = options.reviewUrl?.trim();

  switch (options.templateId) {
    case 'ready':
      return 'היי, המנה שלך מוכנה 🍽️';
    case 'promo':
      return promo || 'הבא עם ההודעה הזו וקבל הנחה על קינוח / שתייה';
    case 'next':
      return dish ? `בפעם הבאה תנסה גם את ה${dish}` : 'בפעם הבאה תנסה גם את ה…';
    case 'google':
      return reviewUrl
        ? `אם נהנית, כוכב בגוגל עוזר לנו מאוד 🙏\n${reviewUrl}`
        : 'אם נהנית, כוכב בגוגל עוזר לנו מאוד 🙏';
  }
}

export type SocialCaptionId = 'grill' | 'new' | 'fresh' | 'storyNow' | 'storyKitchen';

export function getSocialCaptionChips(isStory: boolean): { id: SocialCaptionId; label: string }[] {
  if (isStory) {
    return [
      { id: 'storyNow', label: 'סטורי עכשיו' },
      { id: 'storyKitchen', label: 'מהמטבח' },
      { id: 'grill', label: 'מהגריל' },
      { id: 'fresh', label: 'טרי' },
    ];
  }
  return [
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
