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
  WOLT_PRESET_ID,
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
  pending: 'bg-white/10 text-white/70',
  working: 'bg-violet-500/20 text-violet-200',
  done: 'bg-emerald-500/20 text-emerald-200',
  error: 'bg-red-500/20 text-red-200',
  skipped: 'bg-white/5 text-white/40',
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
  const prompt = buildGeneratePrompt(batchPreset, '');
  const canUseCurrent = isSafeBatchPreset(selectedPreset.id) && selectedPreset.id !== WOLT_PRESET_ID;

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
    await start(prompt, '16:9', selectedModel, onlyIds);
  };

  const handleRetry = async (id: string) => {
    await retryItem(id, prompt, '16:9', selectedModel);
  };

  const handleZip = async () => {
    setZipBusy(true);
    setZipError(null);
    try {
      await downloadBatchZip(
        successes.map(item => ({ fileName: item.fileName, outputUrl: item.outputUrl as string })),
        woltMode,
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
      <div className="rounded-2xl border border-cyan-400/25 bg-cyan-950/35 p-4 md:p-5 space-y-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-200">
            <Truck size={18} />
          </span>
          <div className="space-y-1">
            <p className="text-white font-semibold">תפריט שלם — כמה מנות בבת אחת</p>
            <p className="text-white/55 text-sm leading-relaxed">
              מעלים עד {BATCH_MAX_IMAGES} תמונות, בוחרים סגנון אחד, ומעבדים מנה אחרי מנה.
              כל תמונה עולה שימוש ב־Fal כמו מנה בודדת. {estimate}.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-white/60 text-sm font-semibold">סגנון לכל התפריט</p>
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
                className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  active
                    ? id === WOLT_PRESET_ID
                      ? 'bg-cyan-400 text-zinc-950 border-cyan-300'
                      : 'bg-white text-black border-white'
                    : 'bg-white/5 text-white/70 border-white/20 hover:bg-white/10'
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
            className="text-xs text-cyan-200/80 hover:text-cyan-100 underline underline-offset-2"
          >
            השתמשו בסגנון שנבחר במנה בודדת: {selectedPreset.title}
          </button>
        ) : null}
        <p className="text-white/40 text-xs leading-relaxed">
          ברירת מחדל: משלוחים (וולט) — יחס 16:9 ושיפור עדין של תמונה אמיתית. סגנונות פיצוץ / קולנוע לא זמינים כאן כדי לשמור על תפריט אמין.
        </p>
      </div>

      <BatchImageUploader
        items={items}
        disabled={isRunning}
        onAddFiles={addFiles}
        onRemove={removeItem}
      />

      {notice ? (
        <p className="text-amber-100 text-sm rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2">
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
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isRunning ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
          className="px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-white/80 text-sm font-semibold disabled:opacity-30"
        >
          נקה הכל
        </button>
      </div>

      {items.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-white font-semibold text-sm">
              {progressLabel}
              {doneCount > 0 ? ` · ${doneCount} מוכנות` : ''}
              {errorCount > 0 ? ` · ${errorCount} שגיאות` : ''}
            </p>
            <p className="text-white/40 text-xs">אחת אחרי השנייה — לא במקביל</p>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-cyan-400 to-emerald-400 transition-all"
              style={{ width: `${items.length ? (processedCount / items.length) * 100 : 0}%` }}
            />
          </div>

          <ul className="space-y-2">
            {items.map((item, index) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2"
              >
                <img
                  src={item.outputUrl ?? item.previewUrl}
                  alt=""
                  className="h-14 w-20 rounded-lg object-cover bg-black shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm truncate">{index + 1}. {item.fileName}</p>
                  <p className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_CLASS[item.status]}`}>
                    {STATUS_HE[item.status]}
                  </p>
                  {item.error ? (
                    <p className="text-red-200/80 text-xs mt-1 line-clamp-2">{item.error}</p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  {item.status === 'pending' || item.status === 'error' ? (
                    <button
                      type="button"
                      onClick={() => skipItem(item.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-white/70 hover:bg-white/10"
                    >
                      <SkipForward size={12} /> דלג
                    </button>
                  ) : null}
                  {item.status === 'error' ? (
                    <button
                      type="button"
                      disabled={isRunning}
                      onClick={() => void handleRetry(item.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-amber-100 hover:bg-white/10 disabled:opacity-40"
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
          <p className="text-white font-semibold">התוצאות</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {successes.map(item => (
              <figure
                key={item.id}
                className="overflow-hidden rounded-xl border border-white/10 bg-black/40"
              >
                <img src={item.outputUrl ?? ''} alt={item.fileName} className="w-full aspect-video object-cover" />
                <figcaption className="px-2 py-1.5 text-[11px] text-white/55 truncate">
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
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-sm shadow-[0_0_24px_rgba(6,182,212,0.35)] disabled:opacity-50"
          >
            {zipBusy ? (
              <>
                <span className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                מכין ZIP…
              </>
            ) : (
              <>
                <Archive size={18} />
                {woltMode ? 'הורד הכל (ZIP) — וולט 16:9' : 'הורד הכל (ZIP)'}
              </>
            )}
          </motion.button>
          <p className="text-white/40 text-xs text-center">
            {woltMode
              ? 'הקובץ כולל JPG אופקי 16:9 נקי לכל מנה מוכנה. מנות שנכשלו לא נכנסות.'
              : 'הקובץ כולל את התמונות שכבר מוכנות. מנות שנכשלו לא נכנסות.'}
          </p>
          {zipError ? (
            <p className="text-red-200 text-xs bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {zipError}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
