'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Archive, RotateCcw, SkipForward, Sparkles, Truck } from 'lucide-react';
import { BatchImageUploader } from '@/components/BatchImageUploader';
import { useBatchPipeline, type BatchItemStatus } from '@/hooks/useBatchPipeline';
import { downloadBatchZip } from '@/lib/batch-zip';
import {
  BATCH_MAX_IMAGES,
  BATCH_SECONDS_PER_IMAGE_MAX,
  BATCH_SECONDS_PER_IMAGE_MIN,
  buildGeneratePrompt,
  getPresetById,
  isSafeBatchPreset,
  SAFE_BATCH_PRESET_IDS,
  TIKTOK_PRESET_ID,
  WOLT_PRESET_ID,
  forcedAspectForPreset,
  type Preset,
} from '@/lib/presets';
import type { FalModelId } from '@/lib/fal-generate';

const STATUS_HE: Record<BatchItemStatus, string> = {
  pending: 'ממתין',
  working: 'בעבודה',
  done: 'מוכן',
  error: 'שגיאה',
  skipped: 'דולג',
};

const STATUS_CLASS: Record<BatchItemStatus, string> = {
  pending: 'bg-surface text-muted',
  working: 'bg-cta/15 text-cta',
  done: 'bg-cta text-cta-ink',
  error: 'bg-[#9a3b32]/20 text-[#f3d6d2]',
  skipped: 'bg-bg text-muted/70',
};

interface Props {
  selectedPreset: Preset;
  selectedModel: FalModelId;
  onRunningChange?: (running: boolean) => void;
}

export function BatchMenuPanel({ selectedPreset, selectedModel, onRunningChange }: Props) {
  const {
    items,
    isRunning,
    notice,
    addFiles,
    removeItem,
    skipItem,
    retryItem,
    start,
    clearAll,
    processedCount,
    doneCount,
    errorCount,
    workingIndex,
  } = useBatchPipeline();

  const [presetId, setPresetId] = useState<typeof SAFE_BATCH_PRESET_IDS[number]>(WOLT_PRESET_ID);
  const [zipBusy, setZipBusy] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);

  const batchPreset = getPresetById(presetId);
  const woltMode = batchPreset.id === WOLT_PRESET_ID;
  const tiktokMode = batchPreset.id === TIKTOK_PRESET_ID;
  const batchAspect = forcedAspectForPreset(batchPreset.id) ?? '16:9';
  const zipKind = woltMode ? 'wolt' : tiktokMode ? 'tiktok' : 'original';
  const prompt = buildGeneratePrompt(batchPreset, '');
  const canUseCurrent = isSafeBatchPreset(selectedPreset.id) && presetId !== selectedPreset.id;

  useEffect(() => {
    onRunningChange?.(isRunning);
    return () => onRunningChange?.(false);
  }, [isRunning, onRunningChange]);

  const estimate = useMemo(() => {
    const pending = items.filter(item => item.status === 'pending' || item.status === 'error').length;
    const count = pending > 0 ? pending : items.length;
    if (count === 0) {
      return `כ־${BATCH_SECONDS_PER_IMAGE_MIN}–${BATCH_SECONDS_PER_IMAGE_MAX} שניות למנה`;
    }
    return `כ־${count * BATCH_SECONDS_PER_IMAGE_MIN}–${count * BATCH_SECONDS_PER_IMAGE_MAX} שניות ל־${count} מנות`;
  }, [items]);

  const successes = items.filter(item => item.status === 'done' && item.outputUrl);

  const runBatch = async (onlyIds?: string[]) => {
    await start(prompt, batchAspect, selectedModel, onlyIds);
  };

  const handleRetry = async (id: string) => {
    await retryItem(id, prompt, batchAspect, selectedModel);
  };

  const handleZip = async () => {
    setZipBusy(true);
    setZipError(null);
    try {
      await downloadBatchZip(
        successes.map(item => ({ fileName: item.fileName, outputUrl: item.outputUrl as string })),
        zipKind,
      );
    } catch (err) {
      console.error(err);
      setZipError('לא הצלחנו להכין את ה־ZIP. נסו שוב.');
    } finally {
      setZipBusy(false);
    }
  };

  const progressLabel = items.length === 0
    ? `0 מתוך ${BATCH_MAX_IMAGES}`
    : workingIndex >= 0
      ? `${workingIndex + 1} מתוך ${items.length}`
      : `${processedCount} מתוך ${items.length}`;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="panel-gold space-y-3 rounded-2xl p-4 md:p-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cta/15 text-cta">
            <Truck size={18} />
          </span>
          <div className="space-y-1">
            <p className="font-semibold text-cream">תפריט שלם — כמה מנות בבת אחת</p>
            <p className="text-sm leading-relaxed text-muted">
              מעלים עד {BATCH_MAX_IMAGES} תמונות, בוחרים סגנון אחד, ומעבדים מנה אחרי מנה.
              כל תמונה עולה שימוש ב־Fal כמו מנה בודדת. {estimate}.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-muted">סגנון לכל התפריט</p>
        <div className="flex flex-wrap gap-2">
          {SAFE_BATCH_PRESET_IDS.map(id => {
            const preset = getPresetById(id);
            const active = presetId === id;
            return (
              <button
                key={id}
                type="button"
                disabled={isRunning}
                onClick={() => setPresetId(id)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                  active ? 'chip-on' : 'chip-off'
                } ${isRunning ? 'opacity-50' : ''}`}
              >
                {preset.title}
              </button>
            );
          })}
        </div>
        {canUseCurrent && presetId !== selectedPreset.id ? (
          <button
            type="button"
            disabled={isRunning}
            onClick={() => {
              if (isSafeBatchPreset(selectedPreset.id)) setPresetId(selectedPreset.id);
            }}
            className="text-xs text-cta underline underline-offset-2 hover:text-cream"
          >
            השתמשו בסגנון שנבחר במנה בודדת: {selectedPreset.title}
          </button>
        ) : null}
        <p className="text-xs leading-relaxed text-muted">
          ברירת מחדל: מוכן לוולט — יחס 16:9. מוכן לסטורי כופה 9:16. סגנונות פרסום דרמטי / קולנוע לא זמינים כאן כדי לשמור על תפריט אמין.
        </p>
      </div>

      <BatchImageUploader
        items={items}
        disabled={isRunning}
        onAddFiles={addFiles}
        onRemove={removeItem}
      />

      {notice ? (
        <p className="rounded-xl border border-cta/40 bg-cta/10 px-3 py-2 text-sm text-cream">
          {notice}
        </p>
      ) : null}

      <div className="flex flex-col sm:flex-row gap-3">
        <motion.button
          type="button"
          whileHover={!isRunning && items.some(item => item.status === 'pending' || item.status === 'error') ? { scale: 1.01 } : {}}
          whileTap={!isRunning && items.some(item => item.status === 'pending' || item.status === 'error') ? { scale: 0.98 } : {}}
          disabled={isRunning || !items.some(item => item.status === 'pending' || item.status === 'error')}
          onClick={() => void runBatch()}
          className="btn-cta flex-1"
        >
          {isRunning ? (
            <>
              <span className="spinner-ink h-4 w-4 animate-spin rounded-full" />
              מעבדים תפריט…
            </>
          ) : (
            <>
              <Sparkles size={18} />
              {doneCount > 0 ? 'המשך / נסה שוב שגיאות' : 'שפר את כל המנות'}
            </>
          )}
        </motion.button>
        <button
          type="button"
          disabled={isRunning || items.length === 0}
          onClick={clearAll}
          className="btn-ghost px-4"
        >
          נקה הכל
        </button>
      </div>

      {items.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-cream">
              {progressLabel}
              {doneCount > 0 ? ` · ${doneCount} מוכנות` : ''}
              {errorCount > 0 ? ` · ${errorCount} שגיאות` : ''}
            </p>
            <p className="text-xs text-muted">אחת אחרי השנייה — לא במקביל</p>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-bg">
            <div
              className="h-full bg-cta transition-all"
              style={{ width: `${items.length ? (processedCount / items.length) * 100 : 0}%` }}
            />
          </div>

          <ul className="space-y-2">
            {items.map((item, index) => (
              <li
                key={item.id}
                className="card-gold flex items-center gap-3 rounded-xl p-2"
              >
                <img
                  src={item.outputUrl ?? item.previewUrl}
                  alt=""
                  className="h-14 w-20 shrink-0 rounded-lg bg-bg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-cream">{index + 1}. {item.fileName}</p>
                  <p className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_CLASS[item.status]}`}>
                    {STATUS_HE[item.status]}
                  </p>
                  {item.error ? (
                    <p className="mt-1 line-clamp-2 text-xs text-[#f3d6d2]/80">{item.error}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  {item.status === 'pending' || item.status === 'error' ? (
                    <button
                      type="button"
                      onClick={() => skipItem(item.id)}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-muted hover:bg-cta/10 hover:text-cream"
                    >
                      <SkipForward size={12} /> דלג
                    </button>
                  ) : null}
                  {item.status === 'error' ? (
                    <button
                      type="button"
                      disabled={isRunning}
                      onClick={() => void handleRetry(item.id)}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-cta hover:bg-cta/10 disabled:opacity-40"
                    >
                      <RotateCcw size={12} /> נסה שוב
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {successes.length > 0 ? (
        <div className="space-y-4">
          <p className="font-semibold text-cream">התוצאות</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {successes.map(item => (
              <figure
                key={item.id}
                className="card-gold overflow-hidden rounded-xl"
              >
                <img
                  src={item.outputUrl ?? ''}
                  alt={item.fileName}
                  className={`w-full object-cover ${tiktokMode ? 'aspect-[9/16]' : 'aspect-video'}`}
                />
                <figcaption className="truncate px-2 py-1.5 text-[11px] text-muted">
                  {item.fileName}
                </figcaption>
              </figure>
            ))}
          </div>

          <motion.button
            type="button"
            whileHover={!zipBusy ? { scale: 1.01 } : {}}
            whileTap={!zipBusy ? { scale: 0.98 } : {}}
            disabled={zipBusy}
            onClick={() => void handleZip()}
            className="btn-cta w-full"
          >
            {zipBusy ? (
              <>
                <span className="spinner-ink h-4 w-4 animate-spin rounded-full" />
                מכין ZIP…
              </>
            ) : (
              <>
                <Archive size={18} />
                {woltMode
                  ? 'הורד הכל (ZIP) — וולט 16:9'
                  : tiktokMode
                    ? 'הורד הכל (ZIP) — טיקטוק 9:16'
                    : 'הורד הכל (ZIP)'}
              </>
            )}
          </motion.button>
          <p className="text-center text-xs text-muted">
            {woltMode
              ? 'הקובץ כולל JPG אופקי 16:9 נקי לכל מנה מוכנה. מנות שנכשלו לא נכנסות.'
              : tiktokMode
                ? 'הקובץ כולל JPG אנכי 9:16 נקי לכל מנה מוכנה. מנות שנכשלו לא נכנסות.'
                : 'הקובץ כולל את התמונות שכבר מוכנות. מנות שנכשלו לא נכנסות.'}
          </p>
          {zipError ? (
            <p className="alert-error rounded-lg px-3 py-2 text-xs">{zipError}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
