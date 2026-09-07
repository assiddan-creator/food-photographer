'use client';

import { useEffect, useState } from 'react';
import { OwnerSheet } from '@/components/OwnerSheet';
import { copyText, fetchImageFile, shareImageWithText } from '@/lib/owner-share';
import {
  WHATSAPP_TEMPLATE_CHIPS,
  buildWhatsAppMessage,
  getGoogleReviewUrl,
  type WhatsAppTemplateId,
} from '@/lib/owner-templates';
import { getCustomerWhatsAppHref } from '@/lib/whatsapp';
import { triggerDownload } from '@/lib/wolt-export';

interface Props {
  outputUrl: string;
  onBack: () => void;
}

export function WhatsAppCustomerSheet({ outputUrl, onBack }: Props) {
  const reviewUrl = getGoogleReviewUrl();
  const [templateId, setTemplateId] = useState<WhatsAppTemplateId>('ready');
  const [dishName, setDishName] = useState('');
  const [promoText, setPromoText] = useState('הבא עם ההודעה הזו וקבל הנחה על קינוח / שתייה');
  const [message, setMessage] = useState(() => buildWhatsAppMessage({ templateId: 'ready' }));
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setMessage(
      buildWhatsAppMessage({
        templateId,
        dishName,
        promoText,
        reviewUrl,
      }),
    );
  }, [templateId, dishName, promoText, reviewUrl]);

  const pickTemplate = (id: WhatsAppTemplateId) => {
    setTemplateId(id);
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
      window.open(getCustomerWhatsAppHref(message), '_blank', 'noopener,noreferrer');
      setStatus('התמונה נשמרה. הדביקו את הטקסט וצרפו את התמונה בוואטסאפ.');
    } catch {
      window.open(getCustomerWhatsAppHref(message), '_blank', 'noopener,noreferrer');
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
              templateId === chip.id
                ? 'bg-white text-zinc-950'
                : 'border border-white/20 bg-white/5 text-white/75'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {templateId === 'next' ? (
        <label className="block space-y-1">
          <span className="text-xs text-white/55">שם מנה (לא חובה)</span>
          <input
            type="text"
            dir="rtl"
            value={dishName}
            onChange={e => setDishName(e.target.value)}
            placeholder="שניצל / אנטריקוט / המבורגר"
            className="w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400"
          />
        </label>
      ) : null}

      {templateId === 'promo' ? (
        <label className="block space-y-1">
          <span className="text-xs text-white/55">טקסט מבצע — אפשר לערוך</span>
          <input
            type="text"
            dir="rtl"
            value={promoText}
            onChange={e => setPromoText(e.target.value)}
            className="w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
          />
        </label>
      ) : null}

      <div className="space-y-2">
        <div className="flex justify-start">
          <div className="max-w-[90%] overflow-hidden rounded-2xl rounded-tl-sm bg-[#005c4b] text-white shadow-lg">
            <img src={outputUrl} alt="" className="aspect-[4/3] w-full object-cover" />
            <textarea
              dir="rtl"
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              className="w-full resize-y bg-transparent px-3 py-2.5 text-sm leading-relaxed text-white outline-none"
            />
          </div>
        </div>
        <p className="text-[11px] text-white/35">התמונה מצורפת / נשמרת כדי לשתף בוואטסאפ.</p>
      </div>

      <button
        type="button"
        onClick={handleOpenWhatsApp}
        disabled={busy || !message.trim()}
        className="w-full rounded-2xl bg-[#22c55e] py-3.5 text-sm font-bold text-zinc-950 disabled:opacity-40"
      >
        {busy ? 'פותח…' : 'פתח בוואטסאפ'}
      </button>
      <button
        type="button"
        onClick={handleCopy}
        className="w-full rounded-2xl border border-white/20 py-3 text-sm font-semibold text-white hover:bg-white/10"
      >
        העתק טקסט
      </button>
      {status ? <p className="text-center text-xs text-cyan-200">{status}</p> : null}
      <p className="text-center text-[11px] text-cyan-200/80">
        טיפ: דירוג גוגל = קישור קבוע של המסעדה + בקשה קצרה
      </p>
    </OwnerSheet>
  );
}
