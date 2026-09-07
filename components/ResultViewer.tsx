'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Smartphone, Truck } from 'lucide-react';
import { BackToCameraButton } from '@/components/BackToCameraButton';
import { WhatsAppCustomerSheet } from '@/components/WhatsAppCustomerSheet';
import { SocialPostSheet } from '@/components/SocialPostSheet';
import { WhatsAppMark } from '@/components/WhatsAppMark';
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
  onBackToCamera: () => void;
  latencyMs?: number | null;
  menuGenius?: string | null;
  presetId?: PresetId;
}

export function ResultViewer({
  outputUrl,
  originalPreview,
  onReset,
  onBackToCamera,
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
      <div className="flex">
        <BackToCameraButton onClick={onBackToCamera} />
      </div>
      <div className="flex justify-center gap-2">
        {OWNER_TABS.map(tab => {
          const active = ownerTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setOwnerTab(tab.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                active ? 'chip-on' : 'border border-transparent text-muted hover:text-cream'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <p className="text-center text-xs text-muted">{tabHint}</p>

      {ownerTab === 'whatsapp' ? (
        <WhatsAppCustomerSheet outputUrl={outputUrl} onBack={() => setOwnerTab('hub')} />
      ) : ownerTab === 'page' ? (
        <SocialPostSheet
          outputUrl={outputUrl}
          isStory={isStory}
          onBack={() => setOwnerTab('hub')}
        />
      ) : (
        <div className="panel-gold space-y-4 rounded-2xl p-4 md:p-5">
          <div className="space-y-1">
            <p className="font-semibold text-cream">{readyLabel}</p>
            <p className="text-xs text-muted">לפני / אחרי · מוכן לשליחה</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {cards.map(({ src, label }) => (
              <div key={label} className="card-gold relative overflow-hidden rounded-2xl">
                <img src={src} alt={label} className="aspect-[3/4] w-full object-cover" />
                <span className="absolute bottom-2 right-2 rounded-full bg-bg/80 px-2.5 py-1 text-[11px] font-semibold text-cream">
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
            className="btn-cta w-full"
          >
            {isExportingPrimary ? (
              <span className="spinner-ink h-4 w-4 animate-spin rounded-full" />
            ) : isStory ? (
              <Smartphone size={18} />
            ) : (
              <Truck size={18} />
            )}
            {isStory ? 'הורדה לסטורי · 9:16' : 'הורדה לוולט · 16:9'}
          </motion.button>
          <p className="text-center text-[11px] text-muted">
            {isStory
              ? '9:16 נקי לסטורי / ריל · מנה במרכז · בלי טקסט על התמונה'
              : '16:9 נקי לוולט · מנה במרכז · בלי טקסט על התמונה'}
          </p>

          <motion.button
            type="button"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setOwnerTab('whatsapp')}
            className="btn-cta w-full"
          >
            <WhatsAppMark size={16} />
            שליחה ללקוח בוואטסאפ ▶
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setOwnerTab('page')}
            className="btn-ghost w-full py-3.5"
          >
            פרסום מוכן לעמוד ▶
          </motion.button>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={download} className="btn-ghost">
              הורדה
            </button>
            <button type="button" onClick={shareImage} disabled={isSharing} className="btn-ghost">
              שיתוף
            </button>
          </div>

          <button type="button" onClick={onReset} className="btn-ghost w-full">
            <RotateCcw size={16} />
            נסה סגנון אחר
          </button>
        </div>
      )}

      {actionError ? (
        <p className="alert-error rounded-lg px-3 py-2 text-xs">{actionError}</p>
      ) : null}

      {latencyMs != null ? (
        <p className="text-center text-xs text-muted tabular-nums">
          ⏱️ {(latencyMs / 1000).toFixed(2)}s
        </p>
      ) : null}
    </motion.div>
  );
}
