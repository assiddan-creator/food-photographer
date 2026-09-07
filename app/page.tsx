'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Camera, List, Rocket, Smartphone, Sparkles, Truck, Upload, UtensilsCrossed } from 'lucide-react';
import { Assistant } from 'next/font/google';
import CameraCapture from '@/components/CameraCapture';
import { ImageUploader } from '@/components/ImageUploader';
import { GenerationStatus } from '@/components/GenerationStatus';
import { ResultViewer } from '@/components/ResultViewer';
import { GlassCard } from '@/components/GlassCard';
import { BatchMenuPanel } from '@/components/BatchMenuPanel';
import { usePipeline } from '@/hooks/usePipeline';
import type { FalModelId } from '@/lib/fal-generate';
import {
  buildGeneratePrompt,
  CATEGORY_LABELS,
  CATEGORY_PRESETS,
  forcedAspectForPreset,
  isExperimentalPreset,
  PRESETS,
  type CategoryId,
} from '@/lib/presets';

const assistant = Assistant({ subsets: ['latin', 'hebrew'], weight: ['400', '600', '700'] });

function getAspectRatioFromDimensions(width: number, height: number): '16:9' | '9:16' | '1:1' {
  if (width > height) return '16:9';
  if (height > width) return '9:16';
  return '1:1';
}

export default function Page() {
  const [base64, setBase64] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('classics');
  const [inputMode, setInputMode] = useState<'upload' | 'camera'>('upload');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('9:16');
  const [selectedModel, setSelectedModel] = useState<FalModelId>('fal-ai/nano-banana/edit');
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

  const isRunning = stage === 'generating';
  const selectedPreset = PRESETS[selectedIndex];

  const handleReset = () => {
    // Back to style selection, keep uploaded image
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
      className={`min-h-screen relative p-4 md:p-8 ${assistant.className}`}
      dir="rtl"
    >
      {/* Dynamic background: selected mode image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${selectedPreset.image}')` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-black/80" aria-hidden />

      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-lg border border-white/10 text-white text-sm font-medium">
            <Sparkles size={13} /> Assi &amp; Johnny Photobooth AI
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            צלם מנה → קבל תמונה שמוכרת
          </h1>
          <p className="text-white/40 text-sm md:text-base">
            בלי צלם. בלי סטודיו. בלי שעות עבודה.
          </p>
        </motion.header>

        <div className="flex rounded-2xl overflow-hidden bg-white/5 backdrop-blur-lg border border-white/10 p-1">
          <button
            type="button"
            onClick={() => setStudioMode('single')}
            disabled={isRunning || batchRunning}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
              studioMode === 'single'
                ? 'bg-white/15 text-white border border-white/20'
                : 'text-white/60 hover:text-white/80'
            } ${isRunning || batchRunning ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <UtensilsCrossed size={18} />
            מנה אחת
          </button>
          <button
            type="button"
            onClick={() => setStudioMode('batch')}
            disabled={isRunning || batchRunning}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
              studioMode === 'batch'
                ? 'bg-cyan-400 text-zinc-950 border border-cyan-300'
                : 'text-white/60 hover:text-white/80'
            } ${isRunning || batchRunning ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <Truck size={18} />
            תפריט שלם (כמה מנות)
          </button>
        </div>

        <div className={studioMode === 'single' ? '' : 'hidden'}>
        <AnimatePresence mode="wait">
          {stage === 'done' && outputUrl && preview ? (
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
              <div className="space-y-3">
                <p className="text-white/60 text-sm font-semibold uppercase tracking-wider">
                  בחר סגנון / מצב עסקי
                </p>
                <div className="flex flex-wrap gap-2">
                  {(['classics', 'creators', 'studio', 'cinema', 'social-ai'] as CategoryId[]).map(category => {
                    const isActive = selectedCategory === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => {
                          if (isRunning) return;
                          setSelectedCategory(category);
                          const firstId = CATEGORY_PRESETS[category][0];
                          const firstIndex = PRESETS.findIndex(p => p.id === firstId);
                          if (firstIndex !== -1) setSelectedIndex(firstIndex);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          isActive
                            ? category === 'creators'
                              ? 'bg-rose-400 text-zinc-950 border-rose-300'
                              : 'bg-white text-black border-white'
                            : category === 'creators'
                              ? 'bg-rose-500/10 text-rose-100 border-rose-400/30 hover:bg-rose-500/20'
                              : 'bg-white/5 text-white/70 border-white/20 hover:bg-white/10'
                        }`}
                      >
                        {CATEGORY_LABELS[category]}
                      </button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[280px] overflow-y-auto pr-1">
                  {PRESETS.filter(p => CATEGORY_PRESETS[selectedCategory].includes(p.id)).map(preset => {
                    const originalIndex = PRESETS.findIndex(p => p.id === preset.id);
                    const isSelected = selectedPreset.id === preset.id;
                    const isAuto = preset.id === 'auto';
                    const isMarketing = preset.id === 'marketing';
                    const isIngredients = preset.id === 'ingredients';
                    const isNutrition = preset.id === 'nutrition';
                    const isWolt = preset.id === 'delivery';
                    const isTikTok = preset.id === 'tiktok';
                    const borderClass = isAuto && !isSelected
                      ? 'border-amber-400/50'
                      : isWolt && !isSelected
                        ? 'border-cyan-400/50'
                        : isTikTok && !isSelected
                          ? 'border-rose-400/50'
                          : isMarketing && !isSelected
                            ? 'border-violet-400/60'
                            : isSelected
                              ? isWolt
                                ? 'border-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.35)] bg-white/10'
                                : isTikTok
                                  ? 'border-rose-400 shadow-[0_0_24px_rgba(251,113,133,0.35)] bg-white/10'
                                  : 'border-violet-400 shadow-[0_0_24px_rgba(139,92,246,0.35)] bg-white/10'
                              : 'border-white/10 hover:border-white/20 hover:bg-white/10';
                    return (
                      <motion.button
                        key={preset.id}
                        type="button"
                        onClick={() => !isRunning && originalIndex !== -1 && setSelectedIndex(originalIndex)}
                        disabled={isRunning}
                        whileHover={!isRunning ? { scale: 1.02 } : {}}
                        whileTap={!isRunning ? { scale: 0.98 } : {}}
                        className={`relative rounded-xl p-4 text-right border min-h-[88px] flex flex-col justify-center transition-all duration-200 text-white bg-white/5 backdrop-blur-lg overflow-hidden ${borderClass} ${isRunning ? 'opacity-60 pointer-events-none' : ''}`}
                      >
                        <div
                          className="absolute inset-0 bg-cover bg-center opacity-30"
                          style={{ backgroundImage: `url('${preset.image}')` }}
                          aria-hidden
                        />
                        <span className="relative font-semibold text-sm line-clamp-2 flex items-center gap-1.5">
                          {isAuto && <Sparkles size={14} className="shrink-0 text-amber-300" />}
                          {isWolt && <Truck size={14} className="shrink-0 text-cyan-300" />}
                          {isTikTok && <Smartphone size={14} className="shrink-0 text-rose-300" />}
                          {isMarketing && <Rocket size={14} className="shrink-0 text-violet-300" />}
                          {isIngredients && <List size={14} className="shrink-0 text-white/70" />}
                          {isNutrition && <Activity size={14} className="shrink-0 text-white/70" />}
                          {preset.title}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex rounded-xl overflow-hidden bg-white/5 backdrop-blur-lg border border-white/10 p-1">
                    <button
                      type="button"
                      onClick={() => setInputMode('upload')}
                      disabled={isRunning}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all ${inputMode === 'upload' ? 'bg-white/15 text-white border border-white/20' : 'text-white/60 hover:text-white/80'} ${isRunning ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <Upload size={18} /> העלאה
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode('camera')}
                      disabled={isRunning}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all ${inputMode === 'camera' ? 'bg-white/15 text-white border border-white/20' : 'text-white/60 hover:text-white/80'} ${isRunning ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <Camera size={18} /> מצלמה
                    </button>
                  </div>
                  <AnimatePresence mode="wait">
                    {inputMode === 'upload' ? (
                      <motion.div
                        key="upload"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="min-h-[200px]"
                      >
                        <ImageUploader
                          variant="dark"
                          onClear={() => {
                            setBase64(null);
                            setPreview(null);
                            setSelectedImage(null);
                          }}
                          onImageReady={(b64, prev) => {
                            setBase64(b64);
                            setPreview(prev);
                            setSelectedImage(b64);

                            // Detect aspect ratio from the compressed file URL
                            const img = new Image();
                            img.onload = () => {
                              setAspectRatio(getAspectRatioFromDimensions(img.width, img.height));
                            };
                            img.src = prev;

                            if (stage === 'error') reset();
                          }}
                          disabled={isRunning}
                        />
                      </motion.div>
                    ) : preview ? (
                      <motion.div
                        key="camera-preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-lg border border-white/10"
                      >
                        <div className="relative aspect-square">
                          <img
                            src={preview}
                            alt="תצוגה מקדימה"
                            className="w-full h-full object-contain bg-black"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3 flex justify-center">
                            <motion.button
                              type="button"
                              onClick={() => {
                                setBase64(null);
                                setPreview(null);
                                setSelectedImage(null);
                              }}
                              disabled={isRunning}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/15 border border-white/20 text-white font-semibold text-sm hover:bg-white/25 transition-colors disabled:opacity-50"
                            >
                              <Camera size={18} /> צילום מחדש
                            </motion.button>
                          </div>
                        </div>
                        <p className="text-white/50 text-xs text-center py-2 border-t border-white/10">
                          תמונה מוכנה לסגנון
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="camera"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-lg border border-white/10 p-4"
                      >
                        <CameraCapture
                          onCapture={(base64Image) => {
                            setBase64(base64Image);
                            setPreview(base64Image);
                            setSelectedImage(base64Image);

                            const img = new Image();
                            img.onload = () => {
                              setAspectRatio(getAspectRatioFromDimensions(img.width, img.height));
                            };
                            img.src = base64Image;

                            if (stage === 'error') reset();
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Left column intentionally left focused on upload/camera controls;
                      generation is handled by the primary button on the right. */}
                </div>
                <div className="space-y-4 flex flex-col">
                  <div className="rounded-2xl p-5 flex-1 flex flex-col justify-center bg-white/5 backdrop-blur-lg border border-white/10 text-white">
                    <p className="text-white/50 text-sm mb-1">נבחר</p>
                    <p className="font-semibold">{selectedPreset.title}</p>
                    {selectedPreset.id === 'delivery' ? (
                      <p className="text-cyan-200/80 text-xs mt-2 leading-relaxed">
                        יחס 16:9 נכפה לתאימות וולט. שיפור עדין של תמונה אמיתית — בלי פיצוץ שיווקי.
                      </p>
                    ) : null}
                    {selectedPreset.id === 'tiktok' ? (
                      <p className="text-rose-200/80 text-xs mt-2 leading-relaxed">
                        יחס 9:16 נכפה לטיקטוק / סטורי / ריל. מנה במרכז — שיפור עדין של תמונה אמיתית.
                      </p>
                    ) : null}
                    {isExperimentalPreset(selectedPreset.id) ? (
                      <p className="text-amber-200/80 text-xs mt-2 leading-relaxed">
                        ניסיוני: כיתוב על התמונה לא אמין — עברית עלולה להתעוות. עדיף תוויות קצרות באנגלית.
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-white/70 text-xs font-semibold">
                        מודל AI
                      </label>
                      <select
                        value={selectedModel}
                        onChange={e => setSelectedModel(e.target.value as FalModelId)}
                        disabled={isRunning}
                        className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 disabled:opacity-50"
                      >
                        <option value="fal-ai/nano-banana/edit">Nano Banana (Original)</option>
                        <option value="fal-ai/nano-banana-2/edit">Nano Banana 2 (Fast)</option>
                        <option value="fal-ai/nano-banana-pro/edit">Nano Banana Pro (Quality)</option>
                        <option value="fal-ai/bytedance/seedream/v5/lite/edit">Seedream 5.0 Lite</option>
                        <option value="fal-ai/flux-2-pro/edit">Flux 2 Pro</option>
                      </select>
                    </div>

                    <textarea
                      dir="rtl"
                      value={customPrompt}
                      onChange={e => setCustomPrompt(e.target.value)}
                      placeholder="כתוב חופשי: איפה תרצה לצלם את המנה? (אופציונלי)"
                      disabled={isRunning}
                      rows={3}
                      className="w-full rounded-xl border border-white/20 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30 resize-y min-h-[80px] disabled:opacity-50 backdrop-blur-sm"
                    />
                    <div className="grid sm:grid-cols-2 gap-3">
                      <motion.button
                        whileHover={!isRunning && base64 ? { scale: 1.02 } : {}}
                        whileTap={!isRunning && base64 ? { scale: 0.97 } : {}}
                        onClick={handleGenerate}
                        disabled={isRunning || !base64}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.4)]"
                      >
                        {isRunning ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            מעבד…
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <Sparkles size={18} /> {'צור תמונה משופרת'}
                          </span>
                        )}
                      </motion.button>

                      <motion.button
                        whileHover={!isAnalyzing && selectedImage ? { scale: 1.02 } : {}}
                        whileTap={!isAnalyzing && selectedImage ? { scale: 0.97 } : {}}
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !selectedImage}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                      >
                        {isAnalyzing ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            Chef AI מנתח את המנה...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <Sparkles size={16} /> נתח את המנה (Gemini)
                          </span>
                        )}
                      </motion.button>
                    </div>
                  </div>

                  <p className="text-center text-white/40 text-xs">
                    ⏱️ 5–10 שניות | 💰 מוכן לתפריט, וולט וטיקטוק
                  </p>

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
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {errorMessage && (
          <div className="max-w-4xl mx-auto">
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-100 text-sm">
              {errorMessage}
            </div>
          </div>
        )}

        {analysisResult && (
          <div className="max-w-4xl mx-auto space-y-4">
            <h2 className="text-white text-lg font-semibold text-center">
              Chef AI – ניתוח מנה
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <GlassCard className="p-4 bg-white/5 border border-white/10 text-white space-y-2">
                <p className="text-xs uppercase tracking-wide text-emerald-300 font-semibold">
                  גאון הסושיאל
                </p>
                <p className="text-sm text-white/80 whitespace-pre-line">
                  {analysisResult.menuGenius}
                </p>
              </GlassCard>
              <GlassCard className="p-4 bg-white/5 border border-white/10 text-white space-y-2">
                <p className="text-xs uppercase tracking-wide text-orange-300 font-semibold">
                  ערכים תזונתיים
                </p>
                <p className="text-sm text-white/80 whitespace-pre-line">
                  {analysisResult.healthScanner}
                </p>
              </GlassCard>
              <GlassCard className="p-4 bg-white/5 border border-white/10 text-white space-y-2">
                <p className="text-xs uppercase tracking-wide text-sky-300 font-semibold">
                  ביקורת שף
                </p>
                <p className="text-sm text-white/80 whitespace-pre-line">
                  {analysisResult.platingCritic}
                </p>
              </GlassCard>
              <GlassCard className="p-4 bg-white/5 border border-white/10 text-white space-y-2">
                <p className="text-xs uppercase tracking-wide text-violet-300 font-semibold">
                  סודות המטבח
                </p>
                <p className="text-sm text-white/80 whitespace-pre-line">
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

        <footer className="text-center pt-4 pb-2">
          <p className="text-white/30 text-xs">
            מופעל ע״י Fal.ai · Assi &amp; Johnny Photobooth AI
          </p>
        </footer>
      </div>
    </main>
  );
}
