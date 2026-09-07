'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings';
import {
  DEFAULT_FIRST_CUSTOMER_TEXT,
  DEFAULT_RETURNING_CUSTOMER_TEXT,
  FIRST_ORDER_DISCOUNT_PERCENT,
  RETURNING_DISCOUNT_PERCENT,
  envGoogleReviewUrl,
  envWhatsApp,
  isLikelyHttpUrl,
  isLikelyWhatsAppValue,
  normalizeGoogleReviewUrl,
} from '@/lib/restaurant-settings';

interface Props {
  onClose: () => void;
}

function GoldDot() {
  return <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cta" aria-hidden="true" />;
}

function SettingsCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel-gold space-y-4 rounded-2xl p-4 md:p-5">
      <h2 className="flex items-start gap-2 text-sm font-bold text-cta">
        <GoldDot />
        {title}
      </h2>
      {children}
    </section>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="text-xs font-semibold text-cream">{children}</span>;
}

function FieldHint({ children }: { children: ReactNode }) {
  return <p className="text-[11px] leading-relaxed text-muted">{children}</p>;
}

function LockedRateCard({ title, percent }: { title: string; percent: number }) {
  return (
    <div className="relative rounded-xl border border-cta bg-bg px-3 pb-3 pt-7 text-center">
      <span className="absolute start-2 top-2 rounded-full border border-cta px-2 py-0.5 text-[9px] font-semibold leading-none text-cta">
        נעול
      </span>
      <p className="text-[11px] font-semibold text-cream">{title}</p>
      <p className="mt-1 text-2xl font-bold text-cta">{percent}%</p>
      <p className="mt-1 text-[10px] font-semibold text-muted">קבוע</p>
    </div>
  );
}

export function RestaurantSettingsPanel({ onClose }: Props) {
  const { stored, save } = useRestaurantSettings();
  const [name, setName] = useState(stored.name);
  const [whatsapp, setWhatsapp] = useState(stored.whatsapp);
  const [googleReviewUrl, setGoogleReviewUrl] = useState(stored.googleReviewUrl);
  const [firstCustomerText, setFirstCustomerText] = useState(stored.firstCustomerText);
  const [returningCustomerText, setReturningCustomerText] = useState(stored.returningCustomerText);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(stored.name);
    setWhatsapp(stored.whatsapp);
    setGoogleReviewUrl(stored.googleReviewUrl);
    setFirstCustomerText(stored.firstCustomerText);
    setReturningCustomerText(stored.returningCustomerText);
  }, [stored]);

  const envNumber = envWhatsApp();
  const envReview = envGoogleReviewUrl();

  const markDirty = () => {
    setStatus(null);
    setError(null);
  };

  const handleCheckLink = () => {
    setError(null);
    const url = normalizeGoogleReviewUrl(googleReviewUrl || envReview);
    if (!url) {
      setError('אין קישור לבדיקה. הדביקו קישור מגוגל מפות או מ-Google Business.');
      return;
    }
    if (!isLikelyHttpUrl(url)) {
      setError('קישור גוגל נראה לא תקין.');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
    setStatus('הקישור נפתח בחלון חדש');
  };

  const handleSave = () => {
    setError(null);
    if (!isLikelyWhatsAppValue(whatsapp)) {
      setError('מספר וואטסאפ נראה לא תקין. השתמשו בקידומת, למשל +972 50-000-0000.');
      return;
    }
    if (!isLikelyHttpUrl(googleReviewUrl)) {
      setError('קישור גוגל נראה לא תקין. הדביקו קישור מגוגל מפות או מ-Google Business.');
      return;
    }

    const normalizedReview = normalizeGoogleReviewUrl(googleReviewUrl);
    save({
      name,
      whatsapp,
      googleReviewUrl: normalizedReview,
      firstCustomerText,
      returningCustomerText,
    });
    setGoogleReviewUrl(normalizedReview);
    setStatus('נשמר במכשיר זה');
  };

  return (
    <div className="space-y-5" dir="rtl">
      <header className="space-y-3">
        <button type="button" onClick={onClose} className="btn-ghost rounded-full px-4 py-1.5 text-sm">
          ← חזרה
        </button>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-cream md:text-4xl">הגדרות מסעדה</h1>
          <p className="text-sm text-muted">וואטסאפ · גוגל · נאמנות — בלי קלוריות</p>
        </div>
      </header>

      <SettingsCard title="וואטסאפ ללקוחות">
        <label className="block space-y-1.5">
          <FieldLabel>מספר וואטסאפ (עם קידומת)</FieldLabel>
          <input
            type="tel"
            dir="ltr"
            value={whatsapp}
            onChange={e => {
              setWhatsapp(e.target.value);
              markDirty();
            }}
            placeholder={envNumber || '+972 50-000-0000'}
            className="field-gold w-full rounded-xl px-3 py-2.5 text-sm"
          />
          <FieldHint>
            {whatsapp.trim() || !envNumber
              ? 'משמש ל«שליחה ללקוח» ולתבניות ההודעות.'
              : 'משמש ל«שליחה ללקוח» ולתבניות ההודעות. אם ריק — משתמשים במספר שכבר הוגדר במערכת.'}
          </FieldHint>
        </label>

        <label className="block space-y-1.5">
          <FieldLabel>שם העסק בהודעות</FieldLabel>
          <input
            type="text"
            dir="rtl"
            value={name}
            onChange={e => {
              setName(e.target.value);
              markDirty();
            }}
            placeholder="המסעדה שלי"
            className="field-gold w-full rounded-xl px-3 py-2.5 text-sm"
          />
          <FieldHint>לא חובה. מופיע בחתימת ההודעות ללקוח.</FieldHint>
        </label>
      </SettingsCard>

      <SettingsCard title="דירוג בגוגל">
        <label className="block space-y-1.5">
          <FieldLabel>קישור לדף הדירוג / העסק בגוגל</FieldLabel>
          <input
            type="url"
            dir="ltr"
            value={googleReviewUrl}
            onChange={e => {
              setGoogleReviewUrl(e.target.value);
              markDirty();
            }}
            placeholder={envReview || 'https://g.page/r/…'}
            className="field-gold w-full rounded-xl px-3 py-2.5 text-sm"
          />
          <FieldHint>
            {googleReviewUrl.trim() || !envReview
              ? 'נכנס לתבנית «דירוג בגוגל» בוואטסאפ — בקשה וקישור בלבד, בלי הנחה.'
              : 'נכנס לתבנית «דירוג בגוגל» בוואטסאפ — בקשה וקישור בלבד, בלי הנחה. אם ריק — משתמשים בקישור שכבר הוגדר במערכת.'}
          </FieldHint>
        </label>
        <div className="flex justify-center">
          <button type="button" onClick={handleCheckLink} className="btn-ghost min-w-[12rem] text-cta">
            בדיקת קישור
          </button>
        </div>
      </SettingsCard>

      <SettingsCard title="מועדון נאמנות">
        <p className="text-[11px] text-muted">קבוע במערכת · אין בחירת אחוז</p>
        <div
          className="grid grid-cols-2 gap-2"
          role="group"
          aria-label="הנחות קבועות בהזמנה ישירה"
        >
          <LockedRateCard title="הזמנה ראשונה ישירה" percent={FIRST_ORDER_DISCOUNT_PERCENT} />
          <LockedRateCard title="לקוח חוזר" percent={RETURNING_DISCOUNT_PERCENT} />
        </div>
        <FieldHint>בלי בחירה בין השניים · בלי 15%</FieldHint>
        <label className="block space-y-1.5">
          <FieldLabel>טקסט להזמנה ראשונה (אופציונלי)</FieldLabel>
          <input
            type="text"
            dir="rtl"
            value={firstCustomerText}
            onChange={e => {
              setFirstCustomerText(e.target.value);
              markDirty();
            }}
            placeholder={DEFAULT_FIRST_CUSTOMER_TEXT}
            className="field-gold w-full rounded-xl px-3 py-2.5 text-sm"
          />
        </label>
        <label className="block space-y-1.5">
          <FieldLabel>טקסט ללקוח חוזר (אופציונלי)</FieldLabel>
          <input
            type="text"
            dir="rtl"
            value={returningCustomerText}
            onChange={e => {
              setReturningCustomerText(e.target.value);
              markDirty();
            }}
            placeholder={DEFAULT_RETURNING_CUSTOMER_TEXT}
            className="field-gold w-full rounded-xl px-3 py-2.5 text-sm"
          />
        </label>
        <FieldHint>
          נכנס ל«מבצע היום», «לפעם הבאה» ו«הזמנה ישירה · הטבה». אם ריק — 10% ראשונה / 12% חוזר.
        </FieldHint>
      </SettingsCard>

      {error ? <p className="alert-error rounded-xl px-3 py-2 text-xs">{error}</p> : null}
      {status ? <p className="text-center text-xs text-cta">{status}</p> : null}

      <button type="button" onClick={handleSave} className="btn-cta w-full">
        שמור הגדרות
      </button>
      <p className="text-center text-[11px] text-muted">נשמר במכשיר זה</p>
    </div>
  );
}
