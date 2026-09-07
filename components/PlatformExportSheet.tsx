'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import {
  defaultPlatformSelection,
  DELIVERY_TARGET_IDS,
  downloadFiles,
  exportPlatformFiles,
  PLATFORM_TARGETS,
  shareFiles,
  type PlatformTargetId,
} from '@/lib/platform-export';

interface Props {
  outputUrl: string;
  isStory?: boolean;
  onBack: () => void;
}

export function PlatformExportSheet({ outputUrl, isStory = false, onBack }: Props) {
  const [selected, setSelected] = useState<Set<PlatformTargetId>>(() => defaultPlatformSelection(isStory));
  const [busy, setBusy] = useState<'idle' | 'download' | 'share' | 'delivery'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const selectedIds = useMemo(
    () => PLATFORM_TARGETS.map(target => target.id).filter(id => selected.has(id)),
    [selected],
  );
  const selectedCount = selectedIds.length;
  const isBusy = busy !== 'idle';

  const toggleTarget = (id: PlatformTargetId) => {
    setError(null);
    setStatus(null);
    setSelected(current => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const runExport = async (ids: readonly PlatformTargetId[]) => {
    return exportPlatformFiles(outputUrl, ids);
  };

  const handleDownloadSelected = async () => {
    if (selectedCount === 0) return;
    setBusy('download');
    setError(null);
    setStatus(null);
    try {
      const files = await runExport(selectedIds);
      await downloadFiles(files);
      setStatus(selectedCount === 1 ? 'הקובץ ירד' : 'ירד קובץ ZIP עם התמונות');
    } catch (err) {
      console.error('Platform export failed:', err);
      setError('לא הצלחנו להכין את הקבצים. נסו שוב.');
    } finally {
      setBusy('idle');
    }
  };

  const handleShareSelected = async () => {
    if (selectedCount === 0) return;
    setBusy('share');
    setError(null);
    setStatus(null);
    try {
      const files = await runExport(selectedIds);
      const result = await shareFiles(files);
      if (result === 'shared') {
        setStatus('נשלח');
        return;
      }
      if (result === 'aborted') return;
      await downloadFiles(files);
      setStatus('השיתוף לא זמין במכשיר — ירד קובץ');
    } catch (err) {
      console.error('Platform share failed:', err);
      setError('לא הצלחנו לשתף. אפשר להוריד ולשלוח ידנית.');
    } finally {
      setBusy('idle');
    }
  };

  const handleDeliveryPair = async () => {
    setBusy('delivery');
    setError(null);
    setStatus(null);
    setSelected(new Set(DELIVERY_TARGET_IDS));
    try {
      const files = await runExport(DELIVERY_TARGET_IDS);
      await downloadFiles(files);
      setStatus('ירד ZIP: וולט ותן ביס');
    } catch (err) {
      console.error('Delivery pair export failed:', err);
      setError('לא הצלחנו להכין את קבצי הוולט ותן-ביס. נסו שוב.');
    } finally {
      setBusy('idle');
    }
  };

  return (
    <div className="space-y-5" dir="rtl">
      <header className="space-y-3">
        <button
          type="button"
          onClick={onBack}
          className="btn-ghost rounded-full px-4 py-1.5 text-sm"
        >
          ← חזרה לתוצאה
        </button>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-cream md:text-4xl">לאן מייצאים?</h1>
          <p className="text-sm text-muted">אפשר לבחור כמה יעדים · כל אחד ביחס הנכון</p>
        </div>
      </header>

      <section className="panel-gold flex items-center gap-3 rounded-2xl p-3">
        <img
          src={outputUrl}
          alt="התמונה המוכנה"
          className="size-16 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0 space-y-0.5">
          <p className="font-semibold text-cream">התמונה מוכנה</p>
          <p className="text-xs leading-relaxed text-muted">בחר יעדים להורדה / שיתוף</p>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        {PLATFORM_TARGETS.map(target => {
          const isOn = selected.has(target.id);
          return (
            <button
              key={target.id}
              type="button"
              role="checkbox"
              aria-checked={isOn}
              aria-label={`${target.labelHe} ${target.ratioLabel}`}
              onClick={() => toggleTarget(target.id)}
              className={`relative min-h-[138px] rounded-2xl border-2 p-3 pt-9 text-right transition-colors ${
                isOn
                  ? 'border-cta bg-bg'
                  : 'border-white/12 bg-transparent hover:bg-cta/5'
              }`}
            >
              <span className="absolute top-2 start-2 rounded-full bg-cta px-2 py-0.5 text-[10px] font-bold leading-none text-cta-ink">
                {target.ratioLabel}
              </span>
              {isOn ? (
                <span className="absolute top-2 end-2 text-cta" aria-hidden>
                  <Check size={16} strokeWidth={2.5} />
                </span>
              ) : null}
              <p className="text-base font-bold text-cream">{target.labelHe}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">{target.noteHe}</p>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        <motion.button
          type="button"
          whileHover={!isBusy && selectedCount > 0 ? { scale: 1.01 } : {}}
          whileTap={!isBusy && selectedCount > 0 ? { scale: 0.98 } : {}}
          onClick={handleDownloadSelected}
          disabled={isBusy || selectedCount === 0}
          className="btn-cta w-full"
        >
          {busy === 'download' ? (
            <>
              <span className="spinner-ink h-4 w-4 animate-spin rounded-full" />
              מכין קבצים…
            </>
          ) : (
            `הורד נבחרים (${selectedCount})`
          )}
        </motion.button>

        <motion.button
          type="button"
          whileHover={!isBusy && selectedCount > 0 ? { scale: 1.01 } : {}}
          whileTap={!isBusy && selectedCount > 0 ? { scale: 0.98 } : {}}
          onClick={handleShareSelected}
          disabled={isBusy || selectedCount === 0}
          className="btn-ghost w-full py-3.5"
        >
          {busy === 'share' ? 'מכין לשיתוף…' : 'שתף נבחרים'}
        </motion.button>

        <motion.button
          type="button"
          whileHover={!isBusy ? { scale: 1.01 } : {}}
          whileTap={!isBusy ? { scale: 0.98 } : {}}
          onClick={handleDeliveryPair}
          disabled={isBusy}
          className="btn-ghost w-full py-3.5"
        >
          {busy === 'delivery' ? (
            <>
              <span className="spinner-gold h-4 w-4 animate-spin rounded-full" />
              מכין וולט ותן-ביס…
            </>
          ) : (
            'ייצא הכל לוולט+תן-ביס'
          )}
        </motion.button>
      </div>

      {status ? <p className="text-center text-xs text-cta">{status}</p> : null}
      {error ? <p className="alert-error rounded-lg px-3 py-2 text-xs">{error}</p> : null}
    </div>
  );
}
