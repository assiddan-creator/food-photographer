'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera } from 'lucide-react';
import { Assistant } from 'next/font/google';
import CameraCapture from '@/components/CameraCapture';
import { ImageUploader } from '@/components/ImageUploader';
import { GenerationStatus } from '@/components/GenerationStatus';
import { ResultViewer } from '@/components/ResultViewer';
import { GlassCard } from '@/components/GlassCard';
import { BatchMenuPanel } from '@/components/BatchMenuPanel';
import { PrimaryStyleCards } from '@/components/PrimaryStyleCards';
import { MoreStylesPanel } from '@/components/MoreStylesPanel';
import { AdvancedSettings } from '@/components/AdvancedSettings';
import { StickyCreateBar } from '@/components/StickyCreateBar';
import { PhotoQaCard } from '@/components/PhotoQaCard';
import { KitchenStepper, type KitchenStepId } from '@/components/KitchenStepper';
import { usePipeline } from '@/hooks/usePipeline';
import { DEFAULT_FAL_MODEL } from '@/lib/model-labels';
import { normalizePhotoQa, splitImagePayload, type PhotoQaResult } from '@/lib/photo-qa';
import {
  buildGeneratePrompt,
  forcedAspectForPreset,
  getPresetById,
  isExperimentalPreset,
  isPrimaryPreset,
  PRESETS,
  STYLE_FILTERS,
  WOLT_PRESET_ID,
  type PresetId,
  type PrimaryPresetId,
  type StyleFilterId,
} from '@/lib/presets';

const assistant = Assistant({ subsets: ['latin', 'hebrew'], weight: ['400', '600', '700'] });

const DEFAULT_PRESET_INDEX = Math.max(
  0,
  PRESETS.findIndex(preset => preset.id === WOLT_PRESET_ID),
);

type InputMode = 'camera' | 'upload';
type PhotoQaStatus = 'idle' | 'checking' | 'done' | 'error';

function getAspectRatioFromDimensions(width: number, height: number): '16:9' | '9:16' | '1:1' {
  if (width > height) return '16:9';
  if (height > width) return '9:16';
  return '1:1';
}

function presetIndex(id: PresetId): number {
  const index = PRESETS.findIndex(preset => preset.id === id);
  return index === -1 ? DEFAULT_PRESET_INDEX : index;
}

export default function Page() {
  const [base64, setBase64] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(DEFAULT_PRESET_INDEX);
  const [inputMode, setInputMode] = useState<InputMode>('camera');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('9:16');
  const [selectedModel, setSelectedModel] = useState(DEFAULT_FAL_MODEL);
  const [studioMode, setStudioMode] = useState<'single' | 'batch'>('single');
  const [batchRunning, setBatchRunning] = useState(false);
  const { stage, progress, statusMessage, outputUrl, error, latencyMs, run, reset } = usePipeline();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<null | {
    menuGenius: string;
    healthScanner: string;
    platingCritic: string;
    recipeDetective: string;
  }>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [styleFilter, setStyleFilter] = useState<StyleFilterId>('all');
  const [photoQaStatus, setPhotoQaStatus] = useState<PhotoQaStatus>('idle');
  const [photoQa, setPhotoQa] = useState<PhotoQaResult | null>(null);
  const [photoQaError, setPhotoQaError] = useState<string | null>(null);
  const [checkAcknowledged, setCheckAcknowledged] = useState(false);
  const qaRequestId = useRef(0);

  const isRunning = stage === 'generating';
  const selectedPreset = PRESETS[selectedIndex] ?? getPresetById(WOLT_PRESET_ID);
  const hasImage = Boolean(base64 && preview);
  const showResult = stage === 'done' && Boolean(outputUrl && preview);
  const showStyles = hasImage && checkAcknowledged && !showResult;
  const showCheck = hasImage && !checkAcknowledged && !showResult;

  const kitchenStep: KitchenStepId = showResult
    ? 'actions'
    : showStyles
      ? 'style'
      : showCheck
        ? 'check'
        : 'camera';

  const showSticky = studioMode === 'single' && kitchenStep === 'style' && hasImage;

  const clearImage = (nextMode: InputMode = 'camera') => {
    qaRequestId.current += 1;
    setBase64(null);
    setPreview(null);
    setSelectedImage(null);
    setPhotoQa(null);
    setPhotoQaStatus('idle');
    setPhotoQaError(null);
    setCheckAcknowledged(false);
    setInputMode(nextMode);
  };

  const runPhotoQa = async (imageBase64: string) => {
    const requestId = ++qaRequestId.current;
    setPhotoQaStatus('checking');
    setPhotoQa(null);
    setPhotoQaError(null);

    try {
      const { mimeType, base64: imageData } = splitImagePayload(imageBase64);
      const res = await fetch('/api/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: imageData, mimeType }),
      });

      const data = await res.json().catch(() => ({}));
      if (requestId !== qaRequestId.current) return;

      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Failed to analyze photo');
      }

      setPhotoQa(normalizePhotoQa(data));
      setPhotoQaStatus('done');
    } catch (err) {
      if (requestId !== qaRequestId.current) return;
      setPhotoQaError((err as Error).message);
      setPhotoQa(
        normalizePhotoQa({
          ok: true,
          focusOk: false,
          lightingOk: false,
          framingOk: false,
          issues: [],
          tipHe: 'אפשר להמשיך או לצלם שוב.',
          focusNoteHe: 'לא נבדק אוטומטית — אפשר להמשיך',
          lightingNoteHe: 'לא נבדק אוטומטית — אפשר להמשיך',
          framingNoteHe: 'לא נבדק אוטומטית — אפשר להמשיך',
        }),
      );
      setPhotoQaStatus('error');
    }
  };

  const applyImage = (imageBase64: string, previewUrl: string) => {
    setBase64(imageBase64);
    setPreview(previewUrl);
    setSelectedImage(imageBase64);
    setCheckAcknowledged(false);
    setInputMode('camera');

    const img = new Image();
    img.onload = () => {
      setAspectRatio(getAspectRatioFromDimensions(img.width, img.height));
    };
    img.src = previewUrl;

    if (stage === 'error') reset();
    void runPhotoQa(imageBase64);
  };

  const handleReset = () => {
    reset();
  };

  const handleGenerate = () => {
    if (!base64 || !selectedPreset || !checkAcknowledged) return;

    const prompt = buildGeneratePrompt(selectedPreset, customPrompt, analysisResult?.platingCritic);
    const generateAspect = forcedAspectForPreset(selectedPreset.id) ?? aspectRatio;
    run(base64, prompt, generateAspect, selectedModel);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisResult(null);

    try {
      const { mimeType, base64: base64Data } = splitImagePayload(selectedImage);

      const res = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Data, mimeType }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to analyze image');
      }

      const data = await res.json();
      setAnalysisResult(data);
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main
      className={`relative min-h-screen p-4 md:p-8 ${assistant.className} ${showSticky ? 'pb-40' : ''}`}
      dir="rtl"
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${selectedPreset.image}')` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-black/80" aria-hidden />

      <div className="relative z-10 mx-auto max-w-4xl space-y-5">
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-lg">
            Assi &amp; Johnny · {kitchenStep === 'actions' ? 'פעולות מסעדה' : 'זרימת מסעדה'}
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            {kitchenStep === 'actions' ? 'התמונה מוכנה' : 'צלם מנה ← קבל תמונה שמוכרת'}
          </h1>
          <p className="text-sm text-white/45 md:text-base">
            {kitchenStep === 'actions'
              ? 'בלי קלוריות · רק מה שמוכר במסעדה'
              : 'במסעדה מצלמים עכשיו — לא מחפשים קובץ'}
          </p>
          {studioMode === 'single' && kitchenStep !== 'actions' ? (
            <KitchenStepper current={kitchenStep} />
          ) : null}
        </motion.header>

        <div className="flex overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-lg">
          <button
            type="button"
            onClick={() => setStudioMode('single')}
            disabled={isRunning || batchRunning}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
              studioMode === 'single'
                ? 'bg-white text-zinc-950'
                : 'text-white/60 hover:text-white/80'
            } ${isRunning || batchRunning ? 'pointer-events-none opacity-50' : ''}`}
          >
            מנה אחת
          </button>
          <button
            type="button"
            onClick={() => setStudioMode('batch')}
            disabled={isRunning || batchRunning}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
              studioMode === 'batch'
                ? 'bg-white text-zinc-950'
                : 'text-white/60 hover:text-white/80'
            } ${isRunning || batchRunning ? 'pointer-events-none opacity-50' : ''}`}
          >
            תפריט שלם
          </button>
        </div>

        <div className={studioMode === 'single' ? '' : 'hidden'}>
          <AnimatePresence mode="wait">
            {showResult && outputUrl && preview ? (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ResultViewer
                  outputUrl={outputUrl}
                  originalPreview={preview}
                  onReset={handleReset}
                  latencyMs={latencyMs}
                  menuGenius={analysisResult?.menuGenius ?? undefined}
                  presetId={selectedPreset.id}
                />
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="space-y-4 rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur-xl md:p-5">
                  {showStyles && preview ? (
                    <>
                      <PrimaryStyleCards
                        selectedId={selectedPreset.id}
                        filter={styleFilter}
                        disabled={isRunning}
                        onSelect={id => setSelectedIndex(presetIndex(id))}
                        onFilterChange={id => {
                          setStyleFilter(id);
                          const allowed = STYLE_FILTERS.find(item => item.id === id)?.presetIds ?? [];
                          if (
                            isPrimaryPreset(selectedPreset.id) &&
                            !allowed.includes(selectedPreset.id as PrimaryPresetId) &&
                            allowed[0]
                          ) {
                            setSelectedIndex(presetIndex(allowed[0]));
                          }
                        }}
                      />

                      {selectedPreset.id === 'delivery' ? (
                        <p className="text-xs leading-relaxed text-cyan-200/80">
                          יחס 16:9 נכפה לתאימות וולט. שיפור עדין של תמונה אמיתית — בלי פרסום דרמטי.
                        </p>
                      ) : null}
                      {selectedPreset.id === 'tiktok' ? (
                        <p className="text-xs leading-relaxed text-rose-200/80">
                          יחס 9:16 נכפה לסטורי / ריל / טיקטוק. מנה במרכז — שיפור עדין של תמונה אמיתית.
                        </p>
                      ) : null}
                      {isExperimentalPreset(selectedPreset.id) ? (
                        <p className="text-xs leading-relaxed text-amber-200/80">
                          ניסיוני: כיתוב על התמונה לא אמין — עברית עלולה להתעוות. עדיף תוויות קצרות באנגלית.
                        </p>
                      ) : null}

                      <MoreStylesPanel
                        selectedId={selectedPreset.id}
                        filter={styleFilter}
                        disabled={isRunning}
                        forceOpen={!isPrimaryPreset(selectedPreset.id)}
                        onSelect={id => setSelectedIndex(presetIndex(id))}
                      />

                      <AdvancedSettings
                        selectedModel={selectedModel}
                        customPrompt={customPrompt}
                        disabled={isRunning}
                        onModelChange={setSelectedModel}
                        onCustomPromptChange={setCustomPrompt}
                      />
                    </>
                  ) : showCheck && preview ? (
                    <PhotoQaCard
                      preview={preview}
                      isChecking={photoQaStatus === 'checking'}
                      result={photoQa}
                      errorMessage={photoQaError}
                      onContinue={() => setCheckAcknowledged(true)}
                      onRetake={() => clearImage('camera')}
                    />
                  ) : inputMode === 'upload' ? (
                    <div className="space-y-3">
                      <div className="space-y-1 text-center">
                        <h2 className="text-lg font-bold text-white">העלה מתמונות</h2>
                        <p className="text-sm text-white/45">משני בלבד — עדיף לצלם את המנה עכשיו</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setInputMode('camera')}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                      >
                        <Camera size={16} />
                        חזרה למצלמה
                      </button>
                      <ImageUploader
                        variant="dark"
                        onClear={() => clearImage('camera')}
                        onImageReady={applyImage}
                        disabled={isRunning}
                      />
                    </div>
                  ) : (
                    <CameraCapture
                      autoStart
                      onCapture={base64Image => applyImage(base64Image, base64Image)}
                      onOpenGallery={() => setInputMode('upload')}
                    />
                  )}

                  <AnimatePresence>
                    {(isRunning || stage === 'error') && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <GenerationStatus
                          variant="dark"
                          stage={stage}
                          progress={progress}
                          statusMessage={error ?? statusMessage}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {errorMessage && (
            <div className="mx-auto max-w-4xl">
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {errorMessage}
              </div>
            </div>
          )}

          {analysisResult && (
            <div className="mx-auto max-w-4xl space-y-4">
              <h2 className="text-center text-lg font-semibold text-white">
                Chef AI – ניתוח מנה
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <GlassCard className="space-y-2 border border-white/10 bg-white/5 p-4 text-white">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                    גאון הסושיאל
                  </p>
                  <p className="whitespace-pre-line text-sm text-white/80">
                    {analysisResult.menuGenius}
                  </p>
                </GlassCard>
                <GlassCard className="space-y-2 border border-white/10 bg-white/5 p-4 text-white">
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-300">
                    ערכים תזונתיים
                  </p>
                  <p className="whitespace-pre-line text-sm text-white/80">
                    {analysisResult.healthScanner}
                  </p>
                </GlassCard>
                <GlassCard className="space-y-2 border border-white/10 bg-white/5 p-4 text-white">
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">
                    ביקורת שף
                  </p>
                  <p className="whitespace-pre-line text-sm text-white/80">
                    {analysisResult.platingCritic}
                  </p>
                </GlassCard>
                <GlassCard className="space-y-2 border border-white/10 bg-white/5 p-4 text-white">
                  <p className="text-xs font-semibold uppercase tracking-wide text-violet-300">
                    סודות המטבח
                  </p>
                  <p className="whitespace-pre-line text-sm text-white/80">
                    {analysisResult.recipeDetective}
                  </p>
                </GlassCard>
              </div>
            </div>
          )}
        </div>

        <div className={studioMode === 'batch' ? '' : 'hidden'}>
          <BatchMenuPanel
            selectedPreset={selectedPreset}
            selectedModel={selectedModel}
            onRunningChange={setBatchRunning}
          />
        </div>

        <footer className="pt-4 pb-2 text-center">
          <p className="text-xs text-white/30">
            מופעל ע״י Fal.ai · Assi &amp; Johnny Photobooth AI
          </p>
        </footer>
      </div>

      {showSticky ? (
        <StickyCreateBar
          hasImage
          isRunning={isRunning}
          isAnalyzing={isAnalyzing}
          onGenerate={handleGenerate}
          onAnalyze={handleAnalyze}
        />
      ) : null}
    </main>
  );
}
