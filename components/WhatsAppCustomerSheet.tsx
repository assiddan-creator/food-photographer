'use client';

import { useEffect, useState } from 'react';
import { OwnerSheet } from '@/components/OwnerSheet';
import { copyText, fetchImageFile, shareImageWithText } from '@/lib/owner-share';
import {
  LOYALTY_CHIPS,
  WHATSAPP_TEMPLATE_CHIPS,
  buildWhatsAppMessage,
  type WhatsAppTemplateId,
} from '@/lib/owner-templates';
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings';
import { defaultLoyaltyKind, type LoyaltyKind } from '@/lib/restaurant-settings';
import { getCustomerWhatsAppHref } from '@/lib/whatsapp';
import { triggerDownload } from '@/lib/wolt-export';
import { WhatsAppMark } from '@/components/WhatsAppMark';

interface Props {
  outputUrl: string;
  onBack: () => void;
  onOpenSettings?: () => void;
}

export function WhatsAppCustomerSheet({ outputUrl, onBack, onOpenSettings }: Props) {
  const { resolved } = useRestaurantSettings();
  const reviewUrl = resolved.googleReviewUrl;
  const [templateId, setTemplateId] = useState<WhatsAppTemplateId>('ready');
  const [loyaltyKind, setLoyaltyKind] = useState<LoyaltyKind>('first');
  const [dishName, setDishName] = useState('');
  const [message, setMessage] = useState(() => buildWhatsAppMessage({ templateId: 'ready' }));
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const usesLoyalty = templateId === 'promo' || templateId === 'next';

  useEffect(() => {
    setMessage(
      buildWhatsAppMessage({
        templateId,
        dishName,
        loyaltyKind,
        reviewUrl,
        businessName: resolved.name,
        firstCustomerText: resolved.firstCustomerText,
        returningCustomerText: resolved.returningCustomerText,
      }),
    );
  }, [
    templateId,
    dishName,
    loyaltyKind,
    reviewUrl,
    resolved.name,
    resolved.firstCustomerText,
    resolved.returningCustomerText,
  ]);

  const pickTemplate = (id: WhatsAppTemplateId) => {
    setTemplateId(id);
    if (id === 'promo' || id === 'next') {
      setLoyaltyKind(defaultLoyaltyKind(id));
    }
    setStatus(null);
  };

  const saveImage = async () => {
    const file = await fetchImageFile(outputUrl, `dish-${Date.now()}.jpg`);
    triggerDownload(file, file.name);
    return file;
  };

  const handleCopy = async () => {
    const ok = await copyText(message);
    setStatus(ok ? 'הטקסט הועתק' : 'לא הצלחנו להעתיק. העתיקו ידנית.');
  };

  const handleOpenWhatsApp = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const file = await saveImage();
      const result = await shareImageWithText({
        file,
        text: message,
        title: 'שלח ללקוח',
      });
      if (result === 'shared' || result === 'aborted') {
        if (result === 'shared') setStatus('התמונה והטקסט מוכנים לשליחה');
        return;
      }
      window.open(getCustomerWhatsAppHref(message, resolved.whatsapp), '_blank', 'noopener,noreferrer');
      setStatus('התמונה נשמרה. הדביקו את הטקסט וצרפו את התמונה בוואטסאפ.');
    } catch {
      window.open(getCustomerWhatsAppHref(message, resolved.whatsapp), '_blank', 'noopener,noreferrer');
    } finally {
      setBusy(false);
    }
  };

  return (
    <OwnerSheet
      title="הודעה ללקוח"
      subtitle="בחר תבנית · אפשר לערוך לפני שליחה"
      onBack={onBack}
    >
      <div className="flex flex-wrap gap-2">
        {WHATSAPP_TEMPLATE_CHIPS.map(chip => (
          <button
            key={chip.id}
            type="button"
            onClick={() => pickTemplate(chip.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              templateId === chip.id ? 'chip-on' : 'chip-off'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {usesLoyalty ? (
        <div className="space-y-2">
          <p className="text-xs text-muted">איזו הנחה לשלוח</p>
          <div className="flex flex-wrap gap-2">
            {LOYALTY_CHIPS.map(chip => (
              <button
                key={chip.id}
                type="button"
                onClick={() => {
                  setLoyaltyKind(chip.id);
                  setStatus(null);
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  loyaltyKind === chip.id ? 'chip-on' : 'chip-off'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {templateId === 'next' ? (
        <label className="block space-y-1">
          <span className="text-xs text-muted">שם מנה (לא חובה)</span>
          <input
            type="text"
            dir="rtl"
            value={dishName}
            onChange={e => setDishName(e.target.value)}
            placeholder="שניצל / אנטריקוט / המבורגר"
            className="field-gold w-full rounded-xl px-3 py-2.5 text-sm"
          />
        </label>
      ) : null}

      {templateId === 'next' &&
      (resolved.firstCustomerText || resolved.returningCustomerText) ? (
        <p className="text-[11px] leading-relaxed text-muted">משתמש בטקסט מ«הגדרות מסעדה».</p>
      ) : null}

      {templateId === 'google' ? (
        <p className="text-[11px] leading-relaxed text-muted">
          בקשה לדירוג + קישור בלבד. בלי הנחה — מדיניות גוגל.
        </p>
      ) : null}

      <div className="space-y-2">
        <div className="flex justify-start">
          <div className="card-gold max-w-[90%] overflow-hidden rounded-2xl rounded-tl-sm text-cream shadow-lg">
            <img src={outputUrl} alt="" className="aspect-[4/3] w-full object-cover" />
            <textarea
              dir="rtl"
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              className="w-full resize-y bg-transparent px-3 py-2.5 text-sm leading-relaxed text-cream outline-none"
            />
          </div>
        </div>
        <p className="text-[11px] text-muted">התמונה מצורפת / נשמרת כדי לשתף בוואטסאפ.</p>
      </div>

      {!resolved.whatsapp || (templateId === 'google' && !reviewUrl) ? (
        <div className="rounded-xl border border-[color:var(--gold-border)] px-3 py-2.5 text-[11px] leading-relaxed text-muted">
          {!resolved.whatsapp ? <p>אין מספר וואטסאפ. אפשר עדיין לפתוח שיתוף כללי.</p> : null}
          {templateId === 'google' && !reviewUrl ? <p>אין קישור דירוג — ההודעה תישלח בלי קישור.</p> : null}
          {onOpenSettings ? (
            <button
              type="button"
              onClick={onOpenSettings}
              className="mt-2 text-xs font-semibold text-cta"
            >
              להגדרות מסעדה
            </button>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleOpenWhatsApp}
        disabled={busy || !message.trim()}
        className="btn-cta w-full"
      >
        <WhatsAppMark size={16} />
        {busy ? 'פותח…' : 'פתח בוואטסאפ'}
      </button>
      <button type="button" onClick={handleCopy} className="btn-ghost w-full">
        העתק טקסט
      </button>
      {status ? <p className="text-center text-xs text-cream">{status}</p> : null}
    </OwnerSheet>
  );
}
