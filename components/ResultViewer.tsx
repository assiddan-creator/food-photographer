'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Smartphone, Truck } from 'lucide-react';
import { WhatsAppCustomerSheet } from '@/components/WhatsAppCustomerSheet';
import { SocialPostSheet } from '@/components/SocialPostSheet';
import { exportWoltJpeg, triggerDownload } from '@/lib/wolt-export';
import { exportTikTokJpeg } from '@/lib/tiktok-export';
import type { PresetId } from '@/lib/presets';

type OwnerTab = 'hub' | 'whatsapp' | 'page';

const OWNER_TABS: { id: OwnerTab; label: string }[] = [
  { id: 'hub', label: 'מסך פעולות' },
  { id: 'whatsapp', label: 'וואטסאפ' },
  { id: 'page', label: 'לעמוד' },
];

interface Props {
  outputUrl: string;
  originalPreview: string;
  onReset: () => void;
  latencyMs?: number | null;
  menuGenius?: string | null;
  presetId?: PresetId;
}

export function ResultViewer({
  outputUrl,
  originalPreview,
  onReset,
  latencyMs,
  presetId = 'delivery',
}: Props) {
  const [isExportingPrimary, setIsExportingPrimary] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [ownerTab, setOwnerTab] = useState<OwnerTab>('hub');

  const fetchOutputFile = async (filename: string) => {
    const blob = await fetch(outputUrl).then(r => r.blob());
    return new File([blob], filename, { type: blob.type || 'image/jpeg' });
  };

  const download = async () => {
    const blob = await fetch(outputUrl).then(r => r.blob());
    triggerDownload(blob, `food-photo-${Date.now()}.jpg`);
  };

  const isStory = presetId === 'tiktok';
  const readyLabel = isStory ? 'מוכן לסטורי' : 'מוכן לוולט';
  const tabHint =
    ownerTab === 'whatsapp'
      ? 'תבניות וואטסאפ · בחירה ← העתקה / פתיחה'
      : ownerTab === 'page'
        ? 'פרסום מוכן לעמוד · העתקה / שיתוף מערכת'
        : 'סדר: וולט ← וואטסאפ ללקוח ← פרסום לעמוד';

  const downloadPrimary = async () => {
    setIsExportingPrimary(true);
    setActionError(null);
    try {
      if (isStory) {
        const jpeg = await exportTikTokJpeg(outputUrl);
        triggerDownload(jpeg, `story-9x16-${Date.now()}.jpg`);
      } else {
        const jpeg = await exportWoltJpeg(outputUrl);
        triggerDownload(jpeg, `wolt-16x9-${Date.now()}.jpg`);
      }
    } catch (err) {
      console.error('Primary export failed:', err);
      setActionError(
        isStory ? 'לא הצלחנו להכין את קובץ הסטורי. נסו שוב.' : 'לא הצלחנו להכין את קובץ הוולט. נסו שוב.',
      );
    } finally {
      setIsExportingPrimary(false);
    }
  };

  const shareImage = async () => {
    setIsSharing(true);
    setActionError(null);
    try {
      const file = await fetchOutputFile(`food-photo-${Date.now()}.jpg`);
      if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'תמונת מנה',
          text: 'המנה מוכנה',
        });
        return;
      }
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'תמונת מנה', text: 'המנה מוכנה', url: outputUrl });
        return;
      }
      await download();
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      console.error('Share failed:', err);
      setActionError('השיתוף לא הצליח. אפשר להוריד ולשלוח ידנית.');
    } finally {
      setIsSharing(false);
    }
  };

  const cards = [
    { src: originalPreview, label: 'לפני' },
    { src: outputUrl, label: 'אחרי' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
      dir="rtl"
    >
      <div className="flex justify-center gap-2">
        {OWNER_TABS.map(tab => {
          const active = ownerTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setOwnerTab(tab.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                active
                  ? 'border border-cyan-400 text-white'
                  : 'border border-transparent text-white/45 hover:text-white/75'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <p className="text-center text-xs text-white/40">{tabHint}</p>

      {ownerTab === 'whatsapp' ? (
        <WhatsAppCustomerSheet outputUrl={outputUrl} onBack={() => setOwnerTab('hub')} />
      ) : ownerTab === 'page' ? (
        <SocialPostSheet
          outputUrl={outputUrl}
          isStory={isStory}
          onBack={() => setOwnerTab('hub')}
        />
      ) : (
        <div className="space-y-4 rounded-2xl border border-white/10 bg-black/45 p-4 md:p-5">
          <div className="space-y-1">
            <p className="font-semibold text-white">{readyLabel}</p>
            <p className="text-xs text-white/50">לפני / אחרי · מוכן לשליחה</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {cards.map(({ src, label }) => (
              <div key={label} className="relative overflow-hidden rounded-2xl bg-zinc-900">
                <img src={src} alt={label} className="aspect-[3/4] w-full object-cover" />
                <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <motion.button
            type="button"
            whileHover={!isExportingPrimary ? { scale: 1.01 } : {}}
            whileTap={!isExportingPrimary ? { scale: 0.98 } : {}}
            onClick={downloadPrimary}
            disabled={isExportingPrimary}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 py-3.5 text-sm font-bold text-zinc-950 disabled:opacity-50"
          >
            {isExportingPrimary ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950/30 border-t-zinc-950" />
            ) : isStory ? (
              <Smartphone size={18} />
            ) : (
              <Truck size={18} />
            )}
            {isStory ? 'הורדה לסטורי · 9:16' : 'הורדה לוולט · 16:9'}
          </motion.button>
          <p className="text-center text-[11px] text-white/40">
            {isStory
              ? '9:16 נקי לסטורי / ריל · מנה במרכז · בלי טקסט על התמונה'
              : '16:9 נקי לוולט · מנה במרכז · בלי טקסט על התמונה'}
          </p>

          <motion.button
            type="button"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setOwnerTab('whatsapp')}
            className="w-full rounded-2xl bg-[#22c55e] py-3.5 text-sm font-bold text-zinc-950"
          >
            שליחה ללקוח בוואטסאפ ▶
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setOwnerTab('page')}
            className="w-full rounded-2xl border border-white/25 bg-transparent py-3.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            פרסום מוכן לעמוד ▶
          </motion.button>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={download}
              className="rounded-2xl border border-white/25 bg-transparent py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              הורדה
            </button>
            <button
              type="button"
              onClick={shareImage}
              disabled={isSharing}
              className="rounded-2xl border border-white/25 bg-transparent py-3 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50"
            >
              שיתוף
            </button>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/25 bg-transparent py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            <RotateCcw size={16} />
            נסה סגנון אחר
          </button>
        </div>
      )}

      {actionError ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {actionError}
        </p>
      ) : null}

      {latencyMs != null ? (
        <p className="text-center text-xs text-white/35 tabular-nums">
          ⏱️ {(latencyMs / 1000).toFixed(2)}s
        </p>
      ) : null}
    </motion.div>
  );
}
