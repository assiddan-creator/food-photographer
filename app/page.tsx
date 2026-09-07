'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Sparkles, Truck, Upload, UtensilsCrossed } from 'lucide-react';
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
import { usePipeline } from '@/hooks/usePipeline';
import { DEFAULT_FAL_MODEL } from '@/lib/model-labels';
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
  const [inputMode, setInputMode] = useState<'upload' | 'camera'>('upload');
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

  const isRunning = stage === 'generating';
  const selectedPreset = PRESETS[selectedIndex] ?? getPresetById(WOLT_PRESET_ID);
  const hasImage = Boolean(base64 && preview);
  const showResult = stage === 'done' && Boolean(outputUrl && preview);
  const showSticky = studioMode === 'single' && !showResult;

  const clearImage = () => {
    setBase64(null);
    setPreview(null);
    setSelectedImage(null);
    setInputMode('upload');
  };

  const applyImage = (imageBase64: string, previewUrl: string) => {
    setBase64(imageBase64);
    setPreview(previewUrl);
    setSelectedImage(imageBase64);

    const img = new Image();
    img.onload = () => {
      setAspectRatio(getAspectRatioFromDimensions(img.width, img.height));
    };
    img.src = previewUrl;

    if (stage === 'error') reset();
  };

  const handleReset = () => {
    reset();
  };

  const handleGenerate = () => {
    if (!base64 || !selectedPreset) return;

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
      const base64Data = selectedImage.includes(',')
        ? selectedImage.split(',')[1]
        : selectedImage;

      let mimeType = 'image/jpeg';
      if (selectedImage.startsWith('data:')) {
        const match = selectedImage.match(/^data:(.*?);base64,/);
        if (match?.[1]) mimeType = match[1];
      }

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

      <div className="relative z-10 mx-auto max-w-4xl space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-lg">
            <Sparkles size={13} /> Assi &amp; Johnny Photobooth AI
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            צלם מנה → קבל תמונה שמוכרת
          </h1>
          <p className="text-sm text-white/40 md:text-base">
            בלי צלם. בלי סטודיו. בלי שעות עבודה.
          </p>
        </motion.header>

        <div className="flex overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-lg">
          <button
            type="button"
            onClick={() => setStudioMode('single')}
            disabled={isRunning || batchRunning}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
              studioMode === 'single'
                ? 'border border-white/20 bg-white/15 text-white'
                : 'text-white/60 hover:text-white/80'
            } ${isRunning || batchRunning ? 'pointer-events-none opacity-50' : ''}`}
          >
            <UtensilsCrossed size={18} />
            מנה אחת
          </button>
          <button
            type="button"
            onClick={() => setStudioMode('batch')}
            disabled={isRunning || batchRunning}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
              studioMode === 'batch'
                ? 'border border-cyan-300 bg-cyan-400 text-zinc-950'
                : 'text-white/60 hover:text-white/80'
            } ${isRunning || batchRunning ? 'pointer-events-none opacity-50' : ''}`}
          >
            <Truck size={18} />
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
                  {hasImage && preview ? (
                    <>
                      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-3">
                        <img
                          src={preview}
                          alt="תמונה שהועלתה"
                          className="h-14 w-14 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-white">תמונה מוכנה</p>
                          <p className="text-xs text-emerald-300">✓ הועלתה · בחר סגנון</p>
                        </div>
                        <button
                          type="button"
                          onClick={clearImage}
                          disabled={isRunning}
                          className="shrink-0 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 disabled:opacity-40"
                        >
                          החלף
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="flex size-7 items-center justify-center rounded-full bg-cyan-400 text-sm font-bold text-zinc-950">
                          2
                        </span>
                        <span className="font-semibold text-white">בחר סגנון</span>
                      </div>

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
                          יחס 16:9 נכפה לתאימות וולט. שיפור עדין של תמונה אמיתית — בלי פיצוץ שיווקי.
                        </p>
                      ) : null}
                      {selectedPreset.id === 'tiktok' ? (
                        <p className="text-xs leading-relaxed text-rose-200/80">
                          יחס 9:16 נכפה לטיקטוק / סטורי / ריל. מנה במרכז — שיפור עדין של תמונה אמיתית.
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
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="flex size-7 items-center justify-center rounded-full bg-cyan-400 text-sm font-bold text-zinc-950">
                          1
                        </span>
                        <span className="font-semibold text-white">העלה תמונת מנה</span>
                      </div>

                      {inputMode === 'upload' ? (
                        <ImageUploader
                          variant="dark"
                          onClear={clearImage}
                          onImageReady={applyImage}
                          disabled={isRunning}
                        />
                      ) : (
                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
                          <CameraCapture
                            onCapture={base64Image => {
                              applyImage(base64Image, base64Image);
                            }}
                          />
                        </div>
                      )}

                      <div className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-center text-sm font-semibold text-cyan-200">
                        העלה תמונה כדי להמשיך לבחירת סגנון וליצירה
                      </div>

                      <button
                        type="button"
                        onClick={() => setInputMode(inputMode === 'upload' ? 'camera' : 'upload')}
                        className="mx-auto flex items-center gap-2 text-sm text-white/45 hover:text-white/75"
                      >
                        {inputMode === 'upload' ? (
                          <>
                            <Camera size={16} />
                            או צלם במצלמה
                          </>
                        ) : (
                          <>
                            <Upload size={16} />
                            חזרה להעלאה
                          </>
                        )}
                      </button>
                    </>
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
          hasImage={hasImage}
          isRunning={isRunning}
          isAnalyzing={isAnalyzing}
          onGenerate={handleGenerate}
          onAnalyze={handleAnalyze}
        />
      ) : null}
    </main>
  );
}
