'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, RotateCcw, Share2, Smartphone, Truck } from 'lucide-react';
import { toBlob } from 'html-to-image';
import { getWhatsAppHref } from '@/lib/whatsapp';
import { TikTokExportPanel } from '@/components/TikTokExportPanel';
import { WoltExportPanel } from '@/components/WoltExportPanel';
import { WhatsAppCustomerSheet } from '@/components/WhatsAppCustomerSheet';
import { SocialPostSheet } from '@/components/SocialPostSheet';
import { exportWoltJpeg, triggerDownload } from '@/lib/wolt-export';
import { exportTikTokJpeg } from '@/lib/tiktok-export';
import type { PresetId } from '@/lib/presets';

interface Props {
  outputUrl: string;
  originalPreview: string;
  onReset: () => void;
  /** Total generation latency in ms; shown as ⏱️ X.XXs near Download */
  latencyMs?: number | null;
  /** AI-generated caption for Chef's Signature Card (e.g. menuGenius) */
  menuGenius?: string | null;
  /** Selected style — Story/TikTok swaps the primary export to 9:16 */
  presetId?: PresetId;
}

export function ResultViewer({
  outputUrl,
  originalPreview,
  onReset,
  latencyMs,
  menuGenius,
  presetId = 'delivery',
}: Props) {
  const [chefName, setChefName] = useState('');
  const [signatureCard, setSignatureCard] = useState<string | null>(null);
  const [isBuildingCard, setIsBuildingCard] = useState(false);
  const [isExportingPrimary, setIsExportingPrimary] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const collageRef = useRef<HTMLDivElement>(null);

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
      setActionError(isStory ? 'לא הצלחנו להכין את קובץ הסטורי. נסו שוב.' : 'לא הצלחנו להכין את קובץ הוולט. נסו שוב.');
    } finally {
      setIsExportingPrimary(false);
    }
  };

  const openCustomerWhatsApp = () => {
    setWhatsAppOpen(true);
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

  const buildAndShareCard = async () => {
    if (!collageRef.current) return;
    setIsBuildingCard(true);
    setSignatureCard(null);

    try {
      // Fetch image as blob to avoid CORS issues when capturing
      const blob = await fetch(outputUrl).then(r => r.blob());
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Inject content into the collage ref (render in DOM for html-to-image)
      const container = collageRef.current;
      const titleEl = container.querySelector('[data-card-title]');
      const imgEl = container.querySelector('[data-card-image]') as HTMLImageElement;
      const captionEl = container.querySelector('[data-card-caption]');
      const signatureEl = container.querySelector('[data-card-signature]');

      if (titleEl) titleEl.textContent = "כרטיס חתימת שף";
      if (imgEl) {
        imgEl.src = imageDataUrl;
        imgEl.style.display = 'block';
      }
      if (captionEl) {
        captionEl.textContent = menuGenius?.trim() || '';
        (captionEl as HTMLElement).style.display = menuGenius?.trim() ? 'block' : 'none';
      }
      if (signatureEl) {
        signatureEl.textContent = chefName.trim() ? `הוכן ע״י ${chefName.trim()}` : '';
        (signatureEl as HTMLElement).style.display = chefName.trim() ? 'block' : 'none';
      }

      // Wait for image to load
      if (imgEl) {
        await new Promise<void>((resolve, reject) => {
          if (imgEl.complete) return resolve();
          imgEl.onload = () => resolve();
          imgEl.onerror = reject;
        });
      }

      const cardBlob = await toBlob(container, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#18181b',
      });

      if (!cardBlob) throw new Error('toBlob failed');

      const cardUrl = URL.createObjectURL(cardBlob);
      setSignatureCard(cardUrl);

      if (typeof navigator !== 'undefined' && navigator.share) {
        const file = new File([cardBlob], 'chef-card.png', { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: 'Chef AI',
          text: 'בדוק את המנה שלי!',
        });
      } else {
        const a = document.createElement('a');
        a.href = cardUrl;
        a.download = 'chef-card.png';
        a.click();
      }
    } catch (err) {
      console.error('Chef card build/share failed:', err);
    } finally {
      setIsBuildingCard(false);
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
      <div
        ref={collageRef}
        aria-hidden
        className="fixed left-[-9999px] top-0 w-[600px] overflow-hidden rounded-2xl border-2 border-white/20 bg-zinc-900 p-6 text-white shadow-2xl"
        style={{ direction: 'rtl' }}
      >
        <h2
          data-card-title
          className="text-xl font-bold text-white/95 mb-4 border-b border-white/20 pb-3"
        >
          כרטיס חתימת שף
        </h2>
        <img
          data-card-image
          alt=""
          className="w-full aspect-square object-contain rounded-xl bg-black mb-4 hidden"
        />
        <p
          data-card-caption
          className="text-sm text-white/80 whitespace-pre-line mb-2 hidden"
        />
        <p
          data-card-signature
          className="text-sm font-semibold text-violet-300 hidden"
        />
      </div>

      <div className="mx-auto max-w-3xl space-y-4 rounded-2xl border border-white/10 bg-black/45 p-4">
        <div className="space-y-1">
          <p className="font-semibold text-white">התמונה מוכנה · {readyLabel}</p>
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

        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={openCustomerWhatsApp}
          className="w-full rounded-2xl border border-white/20 bg-white/5 py-3.5 text-sm font-semibold text-white hover:bg-white/10"
        >
          שליחה ללקוח בוואטסאפ ▸
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSocialOpen(true)}
          className="w-full rounded-2xl border border-white/20 bg-white/5 py-3.5 text-sm font-semibold text-white hover:bg-white/10"
        >
          פרסום מוכן לעמוד ▸
        </motion.button>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={download}
            className="rounded-2xl border border-white/20 bg-white/5 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            הורדה
          </button>
          <button
            type="button"
            onClick={shareImage}
            disabled={isSharing}
            className="rounded-2xl border border-white/20 bg-white/5 py-3 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50"
          >
            שיתוף
          </button>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white/70 hover:text-white"
        >
          <RotateCcw size={16} />
          נסה סגנון אחר
        </button>
      </div>

      {actionError ? (
        <p className="mx-auto max-w-3xl rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {actionError}
        </p>
      ) : null}

      <WoltExportPanel outputUrl={outputUrl} />
      <TikTokExportPanel outputUrl={outputUrl} />

      {/* Signature input */}
      <div className="max-w-3xl mx-auto space-y-2">
        <input
          type="text"
          dir="rtl"
          value={chefName}
          onChange={e => setChefName(e.target.value)}
          placeholder="הוסף את החתימה שלך... (למשל: הוכן ע״י אסי)"
          disabled={isBuildingCard}
          className="w-full rounded-xl border border-white/20 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-white/50 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30 disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 max-w-3xl mx-auto items-center justify-center">
        {latencyMs != null && (
          <span className="text-white/70 text-sm font-medium tabular-nums" aria-hidden>
            ⏱️ {(latencyMs / 1000).toFixed(2)}s
          </span>
        )}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={buildAndShareCard}
          disabled={isBuildingCard}
          className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 bg-zinc-800/90 hover:bg-zinc-700/90 border border-white/20 text-white font-semibold rounded-xl shadow-lg hover:shadow-violet-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isBuildingCard ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              יוצר כרטיס...
            </>
          ) : (
            <>
              <Share2 size={17} /> שתף עם חתימה אישית
            </>
          )}
        </motion.button>
        <a
          href={getWhatsAppHref()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-5 rounded-xl border border-emerald-400/40 bg-emerald-600/90 hover:bg-emerald-500 text-white font-semibold transition-colors"
        >
          <MessageCircle size={17} /> למסעדות — דברו איתנו
        </a>
      </div>

      <WhatsAppCustomerSheet
        open={whatsAppOpen}
        outputUrl={outputUrl}
        onClose={() => setWhatsAppOpen(false)}
      />
      <SocialPostSheet
        open={socialOpen}
        outputUrl={outputUrl}
        isStory={isStory}
        onClose={() => setSocialOpen(false)}
      />
    </motion.div>
  );
}
