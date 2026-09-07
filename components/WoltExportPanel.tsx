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
    <div className="panel-gold mx-auto max-w-3xl space-y-4 rounded-2xl p-4 md:p-5" dir="rtl">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cta/15 text-cta">
          <Truck size={18} />
        </span>
        <div className="space-y-1">
          <p className="text-base font-semibold text-cream">מוכן לוולט</p>
          <p className="text-xs leading-relaxed text-muted">
            הורדה אחת ליחס 16:9 נקי, בלי טקסט או מסגרת. מתאים לוולט ולתן ביס: רקע מחמיא
            מסחרי, המנה עצמה זהה.
          </p>
        </div>
      </div>

      <motion.button
        type="button"
        whileHover={!isExporting ? { scale: 1.01 } : {}}
        whileTap={!isExporting ? { scale: 0.98 } : {}}
        onClick={downloadWolt}
        disabled={isExporting}
        className="btn-cta w-full"
      >
        {isExporting ? (
          <>
            <span className="spinner-ink h-4 w-4 animate-spin rounded-full" />
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
            className="flex items-start gap-2 rounded-xl bg-bg px-3 py-2"
          >
            <Check size={16} className="mt-0.5 shrink-0 text-cta" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-cream">{item.label}</p>
              <p className="text-xs leading-relaxed text-muted">{item.note}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="text-xs leading-relaxed text-muted">
        באחריותכם לפני העלאה לוולט ולתן ביס:{' '}
        <span className="text-cream/80">מנה בגודל אמיתי</span>
        {' '}(בלי הגדלה מטעה), ללא אנשים בתמונה, ורקע מחמיא בלי כיתוב.
      </p>

      {error ? (
        <p className="alert-error rounded-lg px-3 py-2 text-xs">{error}</p>
      ) : null}
    </div>
  );
}
