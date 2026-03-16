'use client';

import { motion } from 'framer-motion';
import { Download, RotateCcw } from 'lucide-react';

interface Props {
  outputUrl: string;
  originalPreview: string;
  onReset: () => void;
  /** Total generation latency in ms; shown as ⏱️ X.XXs near Download */
  latencyMs?: number | null;
}

export function ResultViewer({ outputUrl, originalPreview, onReset, latencyMs }: Props) {
  const download = async () => {
    const blob = await fetch(outputUrl).then(r => r.blob());
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: `food-photo-${Date.now()}.webp`,
    });
    a.click();
  };

  const cards = [
    { src: originalPreview, label: 'מקור' },
    { src: outputUrl, label: 'AI פרימיום' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
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

      <div className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto items-center">
        {latencyMs != null && (
          <span className="text-white/70 text-sm font-medium tabular-nums" aria-hidden>
            ⏱️ {(latencyMs / 1000).toFixed(2)}s
          </span>
        )}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={download}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl"
        >
          <Download size={17} /> הורדת תמונה
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
