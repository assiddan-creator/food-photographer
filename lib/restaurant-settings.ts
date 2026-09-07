/** Locked Assi loyalty: first direct order 10%, returning 12%. Not 15%. */
export const FIRST_ORDER_DISCOUNT_PERCENT = 10;
export const RETURNING_DISCOUNT_PERCENT = 12;

export type LoyaltyKind = 'first' | 'returning';

export const LOYALTY_PERCENT: Record<LoyaltyKind, number> = {
  first: FIRST_ORDER_DISCOUNT_PERCENT,
  returning: RETURNING_DISCOUNT_PERCENT,
};

export const STORAGE_KEY = 'assi.restaurantSettings.v1';
export const SETTINGS_CHANGED_EVENT = 'assi-restaurant-settings';

export const DEFAULT_FIRST_CUSTOMER_TEXT = `ברוכים הבאים — ${FIRST_ORDER_DISCOUNT_PERCENT}% על ההזמנה הראשונה`;
export const DEFAULT_RETURNING_CUSTOMER_TEXT = `שמחים שחזרתם — ${RETURNING_DISCOUNT_PERCENT}% עלינו`;

export type RestaurantSettings = {
  name: string;
  whatsapp: string;
  googleReviewUrl: string;
  firstCustomerText: string;
  returningCustomerText: string;
};

export const EMPTY_SETTINGS: RestaurantSettings = {
  name: '',
  whatsapp: '',
  googleReviewUrl: '',
  firstCustomerText: '',
  returningCustomerText: '',
};

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function parseSettings(raw: unknown): RestaurantSettings {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_SETTINGS };
  const record = raw as Record<string, unknown>;
  return {
    name: asTrimmedString(record.name),
    whatsapp: asTrimmedString(record.whatsapp),
    googleReviewUrl: asTrimmedString(record.googleReviewUrl),
    firstCustomerText: asTrimmedString(record.firstCustomerText),
    returningCustomerText:
      asTrimmedString(record.returningCustomerText) || asTrimmedString(record.nextVisitText),
  };
}

export function envWhatsApp(): string {
  return process.env.NEXT_PUBLIC_WHATSAPP?.trim() || '';
}

export function envGoogleReviewUrl(): string {
  return process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL?.trim() || '';
}

export function resolveWhatsApp(settings: RestaurantSettings): string {
  return settings.whatsapp.trim() || envWhatsApp();
}

export function resolveGoogleReviewUrl(settings: RestaurantSettings): string | null {
  return settings.googleReviewUrl.trim() || envGoogleReviewUrl() || null;
}

export function readStoredSettings(): RestaurantSettings {
  if (typeof window === 'undefined') return EMPTY_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_SETTINGS;
    return parseSettings(JSON.parse(raw));
  } catch {
    return EMPTY_SETTINGS;
  }
}

export function writeStoredSettings(settings: RestaurantSettings): void {
  if (typeof window === 'undefined') return;
  const next = parseSettings(settings);
  const raw = JSON.stringify(next);
  window.localStorage.setItem(STORAGE_KEY, raw);
  snapshotRaw = raw;
  snapshotCache = next;
  window.dispatchEvent(new Event(SETTINGS_CHANGED_EVENT));
}

export function subscribeSettings(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) onStoreChange();
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener(SETTINGS_CHANGED_EVENT, onStoreChange);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(SETTINGS_CHANGED_EVENT, onStoreChange);
  };
}

let snapshotCache: RestaurantSettings = EMPTY_SETTINGS;
let snapshotRaw: string | null = null;

export function getSettingsSnapshot(): RestaurantSettings {
  if (typeof window === 'undefined') return EMPTY_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === snapshotRaw) return snapshotCache;
    snapshotRaw = raw;
    if (!raw) {
      snapshotCache = EMPTY_SETTINGS;
      return snapshotCache;
    }
    snapshotCache = parseSettings(JSON.parse(raw));
    return snapshotCache;
  } catch {
    snapshotCache = EMPTY_SETTINGS;
    return snapshotCache;
  }
}

export function getServerSettingsSnapshot(): RestaurantSettings {
  return EMPTY_SETTINGS;
}

export function normalizeGoogleReviewUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function isLikelyWhatsAppValue(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (/^https?:\/\//i.test(trimmed)) return /wa\.me/i.test(trimmed) || trimmed.includes('whatsapp');
  return /\d{8,}/.test(trimmed.replace(/\D/g, ''));
}

export function isLikelyHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  try {
    const url = new URL(normalizeGoogleReviewUrl(trimmed));
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function defaultLoyaltyKind(templateId: 'promo' | 'next' | 'bridge'): LoyaltyKind {
  return templateId === 'next' ? 'returning' : 'first';
}
