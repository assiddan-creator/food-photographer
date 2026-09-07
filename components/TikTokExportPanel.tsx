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
    <div className="panel-gold mx-auto max-w-3xl space-y-4 rounded-2xl p-4 md:p-5" dir="rtl">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cta/15 text-cta">
          <Smartphone size={18} />
        </span>
        <div className="space-y-1">
          <p className="text-base font-semibold text-cream">מוכן לסטורי</p>
          <p className="text-xs leading-relaxed text-muted">
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
        className="btn-cta w-full"
      >
        {isExporting ? (
          <>
            <span className="spinner-ink h-4 w-4 animate-spin rounded-full" />
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

      {error ? (
        <p className="alert-error rounded-lg px-3 py-2 text-xs">{error}</p>
      ) : null}
    </div>
  );
}
