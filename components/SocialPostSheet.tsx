'use client';

import { useEffect, useState } from 'react';
import { OwnerSheet } from '@/components/OwnerSheet';
import { copyText, fetchImageFile, shareImageWithText } from '@/lib/owner-share';
import {
  buildSocialCaption,
  getSocialCaptionChips,
  type SocialCaptionId,
} from '@/lib/owner-templates';
import { exportTikTokJpeg, triggerDownload } from '@/lib/tiktok-export';
import { triggerDownload as triggerBlobDownload } from '@/lib/wolt-export';

interface Props {
  open: boolean;
  outputUrl: string;
  isStory: boolean;
  onClose: () => void;
}

export function SocialPostSheet({ open, outputUrl, isStory, onClose }: Props) {
  const chips = getSocialCaptionChips(isStory);
  const [captionId, setCaptionId] = useState<SocialCaptionId>(chips[0]?.id ?? 'grill');
  const [dishName, setDishName] = useState('');
  const [caption, setCaption] = useState(() => buildSocialCaption({ captionId: chips[0]?.id ?? 'grill' }));
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const nextChips = getSocialCaptionChips(isStory);
    setCaptionId(current => (nextChips.some(chip => chip.id === current) ? current : nextChips[0].id));
  }, [open, isStory]);

  useEffect(() => {
    if (!open) return;
    setCaption(buildSocialCaption({ captionId, dishName }));
  }, [open, captionId, dishName]);

  const saveImage = async () => {
    if (isStory) {
      const jpeg = await exportTikTokJpeg(outputUrl);
      triggerDownload(jpeg, `story-9x16-${Date.now()}.jpg`);
      return;
    }
    const file = await fetchImageFile(outputUrl, `page-post-${Date.now()}.jpg`);
    triggerBlobDownload(file, file.name);
  };

  const handleCopyAndSave = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const copied = await copyText(caption);
      await saveImage();
      setStatus(
        copied
          ? isStory
            ? 'הטקסט הועתק והתמונה נשמרה ב־9:16'
            : 'הטקסט הועתק והתמונה נשמרה'
          : 'התמונה נשמרה. העתיקו את הטקסט ידנית.',
      );
    } catch {
      setStatus('לא הצלחנו לשמור. נסו שוב.');
    } finally {
      setBusy(false);
    }
  };

  const handleSystemShare = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const file = await fetchImageFile(outputUrl, `page-post-${Date.now()}.jpg`);
      const result = await shareImageWithText({
        file,
        text: caption,
        title: 'פרסום מוכן לעמוד',
      });
      if (result === 'unavailable') {
        await handleCopyAndSave();
        setStatus('אין שיתוף מערכת כאן. הטקסט הועתק והתמונה נשמרה — העלו ידנית לעמוד.');
      }
    } catch {
      setStatus('השיתוף לא הצליח. אפשר להעתיק ולשמור.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <OwnerSheet open={open} title="פרסום מוכן לעמוד" onClose={onClose}>
      <p className="text-xs text-white/50">
        אין פרסום אוטומטי לפייסבוק. מכינים תמונה וכיתוב — אתם מדביקים בעמוד או בסטורי.
      </p>

      <div className="flex flex-wrap gap-2">
        {chips.map(chip => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setCaptionId(chip.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              captionId === chip.id ? 'bg-cyan-400 text-zinc-950' : 'border border-white/20 text-white/70'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

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

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
        <img
          src={outputUrl}
          alt=""
          className={isStory ? 'aspect-[9/16] w-full object-cover' : 'aspect-[4/5] w-full object-cover'}
        />
        <textarea
          dir="rtl"
          value={caption}
          onChange={e => setCaption(e.target.value)}
          rows={3}
          className="w-full resize-y bg-transparent px-3 py-3 text-sm leading-relaxed text-white outline-none"
        />
      </div>

      {isStory ? (
        <p className="text-[11px] text-rose-200/80">נבחר סטורי · שמירת התמונה היא 9:16.</p>
      ) : null}

      <button
        type="button"
        onClick={handleCopyAndSave}
        disabled={busy}
        className="w-full rounded-2xl bg-cyan-400 py-3.5 text-sm font-bold text-zinc-950 disabled:opacity-40"
      >
        העתק טקסט + שמור תמונה
      </button>
      <button
        type="button"
        onClick={handleSystemShare}
        disabled={busy}
        className="w-full rounded-2xl border border-white/20 py-3 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-40"
      >
        שיתוף מערכת
      </button>
      {status ? <p className="text-center text-xs text-cyan-200">{status}</p> : null}
    </OwnerSheet>
  );
}
