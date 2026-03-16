'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, RotateCcw, Share2 } from 'lucide-react';
import { toBlob } from 'html-to-image';

interface Props {
  outputUrl: string;
  originalPreview: string;
  onReset: () => void;
  /** Total generation latency in ms; shown as ⏱️ X.XXs near Download */
  latencyMs?: number | null;
  /** AI-generated caption for Chef's Signature Card (e.g. menuGenius) */
  menuGenius?: string | null;
}

export function ResultViewer({
  outputUrl,
  originalPreview,
  onReset,
  latencyMs,
  menuGenius,
}: Props) {
  const [chefName, setChefName] = useState('');
  const [signatureCard, setSignatureCard] = useState<string | null>(null);
  const [isBuildingCard, setIsBuildingCard] = useState(false);
  const collageRef = useRef<HTMLDivElement>(null);

  const download = async () => {
    const blob = await fetch(outputUrl).then(r => r.blob());
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: `food-photo-${Date.now()}.webp`,
    });
    a.click();
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
    { src: originalPreview, label: 'מקור' },
    { src: outputUrl, label: 'AI פרימיום' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
      dir="rtl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {cards.map(({ src, label }) => (
          <div
            key={label}
            className="rounded-2xl overflow-hidden bg-zinc-900 border border-white/10"
          >
            <p className="text-white/50 text-xs font-medium uppercase tracking-wider px-3 py-2 border-b border-white/10">
              {label}
            </p>
            <img src={src} alt={label} className="w-full aspect-square object-contain bg-black" />
          </div>
        ))}
      </div>

      {/* Hidden collage template for html-to-image (off-screen, fixed size for consistent output) */}
      <div
        ref={collageRef}
        aria-hidden
        className="absolute left-[-9999px] top-0 w-[600px] overflow-hidden rounded-2xl border-2 border-white/20 bg-zinc-900 p-6 text-white shadow-2xl"
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
          onClick={download}
          className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl"
        >
          <Download size={17} /> הורדת תמונה
        </motion.button>
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
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onReset}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-5 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/15 transition-colors"
        >
          <RotateCcw size={17} /> נסה סגנון אחר
        </motion.button>
      </div>
    </motion.div>
  );
}
