'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings';
import {
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
      <h2 className="flex items-start gap-2 text-sm font-bold text-cream">
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

export function RestaurantSettingsPanel({ onClose }: Props) {
  const { stored, save } = useRestaurantSettings();
  const [name, setName] = useState(stored.name);
  const [whatsapp, setWhatsapp] = useState(stored.whatsapp);
  const [googleReviewUrl, setGoogleReviewUrl] = useState(stored.googleReviewUrl);
  const [nextVisitText, setNextVisitText] = useState(stored.nextVisitText);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(stored.name);
    setWhatsapp(stored.whatsapp);
    setGoogleReviewUrl(stored.googleReviewUrl);
    setNextVisitText(stored.nextVisitText);
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
      nextVisitText,
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
          <button type="button" onClick={handleCheckLink} className="btn-ghost min-w-[12rem]">
            בדיקת קישור
          </button>
        </div>
      </SettingsCard>

      <SettingsCard title="מועדון נאמנות">
        <div className="space-y-2" role="group" aria-label="הנחות קבועות בהזמנה ישירה">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--gold-border)] bg-bg px-3 py-3">
            <p className="text-sm font-semibold text-cream">
              הזמנה ראשונה ישירה · <span className="text-cta">{FIRST_ORDER_DISCOUNT_PERCENT}%</span>
            </p>
            <span className="shrink-0 text-[10px] font-semibold text-muted">קבוע</span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--gold-border)] bg-bg px-3 py-3">
            <p className="text-sm font-semibold text-cream">
              לקוח חוזר · <span className="text-cta">{RETURNING_DISCOUNT_PERCENT}%</span>
            </p>
            <span className="shrink-0 text-[10px] font-semibold text-muted">קבוע</span>
          </div>
        </div>
        <FieldHint>
          מופיע בתבנית «לפעם הבאה». בוולט הולכת עמלה גדולה — {FIRST_ORDER_DISCOUNT_PERCENT}% לחדש ו־
          {RETURNING_DISCOUNT_PERCENT}% לחוזר עדיין משאירים יותר במסעדה. אין הנחה תמורת כוכבים או
          לייקים.
        </FieldHint>
        <label className="block space-y-1.5">
          <FieldLabel>טקסט קצר ללקוח (אופציונלי)</FieldLabel>
          <input
            type="text"
            dir="rtl"
            value={nextVisitText}
            onChange={e => {
              setNextVisitText(e.target.value);
              markDirty();
            }}
            placeholder={`בפעם הבאה — ${RETURNING_DISCOUNT_PERCENT}% עלינו`}
            className="field-gold w-full rounded-xl px-3 py-2.5 text-sm"
          />
          <FieldHint>
            נכנס לתבנית «לפעם הבאה». אם ריק — נשלח {RETURNING_DISCOUNT_PERCENT}% ללקוח חוזר.
          </FieldHint>
        </label>
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
