'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Download, Smartphone } from 'lucide-react';
import { exportTikTokJpeg, triggerDownload } from '@/lib/tiktok-export';

interface Props {
  outputUrl: string;
}

const CHECKLIST = [
  { label: 'אנכי 9:16', note: 'ייצוא אנכי מדויק לטיקטוק' },
  { label: 'מתאים לסטורי/ריל', note: 'פורמט טלפון מלא, בלי פסים' },
  { label: 'מנה במרכז', note: 'חיתוך ממורכז — בדקו שהמנה נשארת בפריים' },
] as const;

export function TikTokExportPanel({ outputUrl }: Props) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadTikTok = async () => {
    setIsExporting(true);
    setError(null);
    try {
      const jpeg = await exportTikTokJpeg(outputUrl);
      triggerDownload(jpeg, `tiktok-9x16-${Date.now()}.jpg`);
    } catch (err) {
      console.error('TikTok export failed:', err);
      setError('לא הצלחנו להכין את קובץ הטיקטוק. נסו שוב.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="max-w-3xl mx-auto rounded-2xl border border-rose-400/30 bg-rose-950/40 p-4 md:p-5 space-y-4"
      dir="rtl"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-400/15 text-rose-200">
          <Smartphone size={18} />
        </span>
        <div className="space-y-1">
          <p className="text-white font-semibold text-base">ליוצרים / טיקטוק</p>
          <p className="text-white/55 text-xs leading-relaxed">
            הורדה אחת ליחס 9:16 אנכי, מוכן לסטורי או ריל. מתאים לאופים ביתיים, עוגות ויוצרי אוכל —
            לא רק למסעדות.
          </p>
        </div>
      </div>

      <motion.button
        type="button"
        whileHover={!isExporting ? { scale: 1.01 } : {}}
        whileTap={!isExporting ? { scale: 0.98 } : {}}
        onClick={downloadTikTok}
        disabled={isExporting}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-zinc-950 font-bold text-sm shadow-[0_0_24px_rgba(244,63,94,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <>
            <span className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
            מכין קובץ 9:16…
          </>
        ) : (
          <>
            <Download size={18} />
            הורדה לטיקטוק (9:16)
          </>
        )}
      </motion.button>

      <ul className="grid sm:grid-cols-3 gap-2">
        {CHECKLIST.map(item => (
          <li
            key={item.label}
            className="flex items-start gap-2 rounded-xl bg-black/25 px-3 py-2"
          >
            <Check size={16} className="mt-0.5 shrink-0 text-emerald-400" aria-hidden />
            <div>
              <p className="text-white text-sm font-semibold">{item.label}</p>
              <p className="text-white/50 text-xs leading-relaxed">{item.note}</p>
            </div>
          </li>
        ))}
      </ul>

      {error ? (
        <p className="text-red-200 text-xs bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {error}
        </p>
      ) : null}
    </div>
  );
}
