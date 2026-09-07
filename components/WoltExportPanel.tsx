'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Download, Truck } from 'lucide-react';
import { exportWoltJpeg, triggerDownload } from '@/lib/wolt-export';

interface Props {
  outputUrl: string;
}

const GUARANTEED = [
  { label: '16:9', note: 'ייצוא אופקי מדויק' },
  { label: 'אופקית', note: 'תמונת רוחב, לא פורטרט' },
  { label: 'ללא טקסט', note: 'בלי כיתוב, מסגרת או ווטרמרק' },
  { label: 'מנה שלמה', note: 'חיתוך ממורכז — בדקו שקצוות הצלחת לא נחתכו' },
] as const;

export function WoltExportPanel({ outputUrl }: Props) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadWolt = async () => {
    setIsExporting(true);
    setError(null);
    try {
      const jpeg = await exportWoltJpeg(outputUrl);
      triggerDownload(jpeg, `wolt-16x9-${Date.now()}.jpg`);
    } catch (err) {
      console.error('Wolt export failed:', err);
      setError('לא הצלחנו להכין את קובץ הוולט. נסו שוב.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="max-w-3xl mx-auto rounded-2xl border border-cyan-400/30 bg-cyan-950/40 p-4 md:p-5 space-y-4"
      dir="rtl"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-200">
          <Truck size={18} />
        </span>
        <div className="space-y-1">
          <p className="text-white font-semibold text-base">מוכן לוולט</p>
          <p className="text-white/55 text-xs leading-relaxed">
            הורדה אחת ליחס 16:9 נקי, בלי טקסט או מסגרת. וולט דוחה תמונות שנוצרו לגמרי ב־AI —
            הנתיב הזה משפר תמונה אמיתית בלבד.
          </p>
        </div>
      </div>

      <motion.button
        type="button"
        whileHover={!isExporting ? { scale: 1.01 } : {}}
        whileTap={!isExporting ? { scale: 0.98 } : {}}
        onClick={downloadWolt}
        disabled={isExporting}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-sm shadow-[0_0_24px_rgba(6,182,212,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <>
            <span className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
            מכין קובץ 16:9…
          </>
        ) : (
          <>
            <Download size={18} />
            הורדה לוולט (16:9)
          </>
        )}
      </motion.button>

      <ul className="grid sm:grid-cols-2 gap-2">
        {GUARANTEED.map(item => (
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

      <p className="text-white/45 text-xs leading-relaxed">
        באחריותכם לפני העלאה לוולט:{' '}
        <span className="text-white/70">מנה בגודל אמיתי</span>
        {' '}(בלי הגדלה מטעה), ללא אנשים בתמונה, ותאורה טבעית בהירה.
      </p>

      {error ? (
        <p className="text-red-200 text-xs bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {error}
        </p>
      ) : null}
    </div>
  );
}
