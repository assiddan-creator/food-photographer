'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Camera, List, Rocket, Sparkles, Upload } from 'lucide-react';
import { Assistant } from 'next/font/google';
import CameraCapture from '@/components/CameraCapture';
import { ImageUploader } from '@/components/ImageUploader';
import { GenerationStatus } from '@/components/GenerationStatus';
import { ResultViewer } from '@/components/ResultViewer';
import { GlassCard } from '@/components/GlassCard';
import { usePipeline } from '@/hooks/usePipeline';

const assistant = Assistant({ subsets: ['latin', 'hebrew'], weight: ['400', '600', '700'] });

const AUTHENTICITY_ANCHOR =
  ' CRITICAL: Preserve the uploaded food exactly as photographed. Do not add, remove, or invent any ingredients. No artistic interpretation of the food itself. Maintain 100% authenticity of the original dish.';

const HEBREW_TYPOGRAPHY =
  ' Use clean, modern Hebrew typography for all text labels. Ensure letters are not reversed.';

const PRESETS = [
  {
    id: 'auto',
    title: 'שיפור חכם (אוטומטי)',
    image: '/Grilled_ribeye_steak_with_fries_a9d6150853.jpeg',
    prompt:
      'Analyze the uploaded food image. Preserve everything exactly as photographed. Apply the most commercially effective food photography enhancement based on the dish type. Improve lighting, color balance, texture clarity, and depth. Natural, realistic, appetizing result. No artistic interpretation. Looks professionally photographed for selling food.' +
      AUTHENTICITY_ANCHOR,
  },
  {
    id: 'marketing',
    title: 'פיצוץ שיווקי',
    image: '/Food_exploding_midair_ingredients_bdf383a9e6.jpeg',
    prompt:
      'Professional food advertising composition based on the uploaded image. Analyze the dish in the photo and transform it into a photorealistic action shot. The main dish dynamically explodes mid-air, with its key ingredients, textures, and garnishes bursting outward in multiple directions. Motion frozen at 1/8000 second shutter speed. Background is a cinematic dark studio setting with heavy bokeh. Apply ultra-detailed photorealistic textures, 8k UHD resolution, and razor-sharp focus. Professional advertising lighting with dramatic side-lighting. Everything must look natural, realistic, and appetizing for a high-end menu. No artistic interpretation, preserve the authentic identity of the food. Remove messy crumbs and clean plate edges.' +
      AUTHENTICITY_ANCHOR,
  },
  {
    id: 'split',
    title: 'תצוגה כפולה',
    image: '/Steak_dish_overhead_macro_b67f1558df.jpeg',
    prompt:
      'A professional food photography diptych, split screen. Left side: perfect overhead top-down view of the dish. Right side: extreme macro profile shot showing layers and texture. Studio lighting, cohesive background.' +
      AUTHENTICITY_ANCHOR,
  },
  {
    id: 'menu',
    title: 'תפריט יוקרתי',
    image: '/Fine_dining_food_presentation_b4749bb336.jpeg',
    prompt:
      'Michelin star fine dining presentation. Dark moody lighting, high contrast, side-lit shadows, rustic dark background. Elegant minimalist styling. Remove messy crumbs, clean plate edges, boost crispness and juicy textures, keep the core food authentic.' +
      AUTHENTICITY_ANCHOR,
  },
  {
    id: 'delivery',
    title: 'משלוחים (וולט)',
    image: '/Food_photography_in_takeaway_box_3bfd93d74b.jpeg',
    prompt:
      'Commercial delivery app food photography, square composition, centered dish, highly vibrant colors, bright even studio lighting, clean minimal background, ultra-sharp detail, mouth-watering appetizing look.' +
      AUTHENTICITY_ANCHOR,
  },
  {
    id: 'ingredients',
    title: 'פירוק מרכיבים',
    image: '/Commercial_food_photography_infographic_style_anal_669a6beeec.jpeg',
    prompt:
      'Commercial food photography infographic style. Analyze the uploaded dish and visually highlight its key ingredients with elegant, minimalist text labels pointing to them. Studio lighting, dark premium background. High-end culinary magazine editorial aesthetic. CRITICAL: Preserve the uploaded food exactly as photographed. Do not add, remove, or invent any ingredients. No artistic interpretation of the food itself. Maintain 100% authenticity of the original dish.' +
      HEBREW_TYPOGRAPHY,
  },
  {
    id: 'nutrition',
    title: 'ערכים תזונתיים',
    image: '/Steak_with_nutritional_facts_ba0b2f7c78.jpeg',
    prompt:
      'High-end fitness and wellness food photography. Analyze the food and display a sleek, modern, floating digital text overlay with estimated macronutrients, calories, and nutritional facts next to the dish. Clean typography, premium dark athletic aesthetic, cinematic lighting. CRITICAL: Preserve the uploaded food exactly as photographed. Do not add, remove, or invent any ingredients. No artistic interpretation of the food itself. Maintain 100% authenticity of the original dish.' +
      HEBREW_TYPOGRAPHY,
  },
  {
    id: 'classic',
    title: 'קלאסי עילי',
    image: '/Steak_with_fries_explosion_6b69564913.jpeg',
    prompt:
      'Professional overhead shot, soft studio lighting, marble surface, shallow depth of field, sharp focus, magazine style.' +
      AUTHENTICITY_ANCHOR,
  },
  {
    id: 'cinematic-cut',
    title: 'קאט קולנועי',
    image: '/Steak_dish_overhead_macro_b67f1558df.jpeg',
    prompt:
      'Cinematic anamorphic lens shot, 2.35:1 aspect ratio feel, moody atmospheric haze, dramatic rim lighting, shot on ARRI Alexa.' +
      AUTHENTICITY_ANCHOR,
  },
  {
    id: 'cyberpunk',
    title: 'סייברפאנק',
    image: '/Extreme_out_of_focus_background_of_a_highend_dark__dfb3863541.jpeg',
    prompt:
      'Futuristic cyberpunk food styling, dark moody setting with neon pink and cyan practical lights reflecting off glossy textures.' +
      AUTHENTICITY_ANCHOR,
  },
  {
    id: 'retro-film',
    title: 'פילם רטרו',
    image: '/Steak_with_nutritional_facts_ba0b2f7c78.jpeg',
    prompt:
      'Nostalgic 35mm film photography, Kodak Portra 400 emulation, natural grain, subtle light leaks, warm retro color grading.' +
      AUTHENTICITY_ANCHOR,
  },
  {
    id: 'live-fire',
    title: 'אש חיה',
    image: '/Closeup_street_food_money_shot_45degree_angle_extr_011a4690a6.jpeg',
    prompt:
      'Dynamic live-fire cooking aesthetic. Flying embers, thick smoke, intense Maillard reaction visible. Dramatic warm backlighting.' +
      AUTHENTICITY_ANCHOR,
  },
  {
    id: 'paparazzi-flash',
    title: 'פלאש פפראצי',
    image: '/Food_exploding_midair_ingredients_bdf383a9e6.jpeg',
    prompt:
      'Trendy UGC direct flash photography, hard shadows, high contrast, 90s disposable camera aesthetic. Raw, authentic, viral Instagram style.' +
      AUTHENTICITY_ANCHOR,
  },
  {
    id: 'zero-gravity',
    title: 'כוח המשיכה',
    image: '/Steak_dish_overhead_macro_b67f1558df.jpeg',
    prompt:
      'Surreal zero-gravity food photography. Key ingredients gracefully floating in mid-air in ultra slow-motion. High-speed sync flash, dark studio background.' +
      AUTHENTICITY_ANCHOR,
  },
  {
    id: 'pov-action',
    title: 'גוף ראשון',
    image: '/Grilled_ribeye_steak_with_fries_a9d6150853.jpeg',
    prompt:
      'First-person POV action shot, hands dynamically interacting with the food (e.g., pouring sauce, cutting). Motion blur on movement, razor-sharp focus on the dish.' +
      AUTHENTICITY_ANCHOR,
  },
  {
    id: 'ai-director',
    title: 'בימוי חכם (AI Director)',
    image: '/Fine_dining_food_presentation_b4749bb336.jpeg',
    prompt:
      "Reconstruct and elevate this exact dish by strictly applying the following professional chef's critique: [AI_CRITIQUE_PLACEHOLDER]. Photorealistic Michelin-star execution." +
      AUTHENTICITY_ANCHOR,
  },
] as const;

type CategoryId = 'classics' | 'studio' | 'cinema' | 'social-ai';

const CATEGORY_PRESETS: Record<CategoryId, string[]> = {
  classics: ['auto', 'menu', 'delivery', 'classic'],
  studio: ['marketing', 'split', 'ingredients', 'nutrition'],
  cinema: ['cinematic-cut', 'cyberpunk', 'retro-film', 'live-fire'],
  'social-ai': ['paparazzi-flash', 'zero-gravity', 'pov-action', 'ai-director'],
};

const CATEGORY_LABELS: Record<CategoryId, string> = {
  classics: 'הקלאסיים',
  studio: 'סטודיו ופרסום',
  cinema: 'סינמטוגרפיה',
  'social-ai': 'סושיאל ו-AI',
};

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
  const [selectedModel, setSelectedModel] = useState<
    | 'fal-ai/nano-banana/edit'
    | 'fal-ai/nano-banana-2/edit'
    | 'fal-ai/nano-banana-pro/edit'
    | 'fal-ai/bytedance/seedream/v5/lite/edit'
    | 'fal-ai/flux-2-pro/edit'
  >('fal-ai/nano-banana/edit');
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

    let prompt: string;

    if (customPrompt.trim() !== '') {
      prompt =
        customPrompt.trim() +
        '. Shot on ARRI Alexa 65 cinema camera with an ARRI/Zeiss Master Prime 50mm T1.3 lens. Adaptive cinematic lighting that perfectly matches the described environment while maintaining appetizing highlights, rich textures, and commercial food styling on the main dish. 8k resolution, ultra-photorealistic. CRITICAL: Preserve the uploaded food exactly as photographed. Do not add, remove, or invent any ingredients. No artistic interpretation of the food itself. Maintain 100% authenticity of the original dish.';
    } else {
      prompt = selectedPreset.prompt;
      if (selectedPreset.id === 'ai-director' && analysisResult?.platingCritic) {
        prompt = prompt.replace('[AI_CRITIQUE_PLACEHOLDER]', analysisResult.platingCritic);
      }
    }

    run(base64, prompt, aspectRatio, selectedModel);
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
                  {(['classics', 'studio', 'cinema', 'social-ai'] as CategoryId[]).map(category => {
                    const isActive = selectedCategory === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => !isRunning && setSelectedCategory(category)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          isActive
                            ? 'bg-white text-black border-white'
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
                    const borderClass = isAuto && !isSelected
                      ? 'border-amber-400/50'
                      : isMarketing && !isSelected
                        ? 'border-violet-400/60'
                        : isSelected
                          ? 'border-violet-400 shadow-[0_0_24px_rgba(139,92,246,0.35)] bg-white/10'
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
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-white/70 text-xs font-semibold">
                        מודל AI
                      </label>
                      <select
                        value={selectedModel}
                        onChange={e =>
                          setSelectedModel(
                            e.target.value as
                              | 'fal-ai/nano-banana/edit'
                              | 'fal-ai/nano-banana-2/edit'
                              | 'fal-ai/nano-banana-pro/edit'
                              | 'fal-ai/bytedance/seedream/v5/lite/edit'
                              | 'fal-ai/flux-2-pro/edit'
                          )
                        }
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
                    ⏱️ 5–10 שניות | 💰 מוכן לתפריט ולוולט
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

        <footer className="text-center pt-4 pb-2">
          <p className="text-white/30 text-xs">
            מופעל ע״י Nano Banana 2 + CodeFormer.
          </p>
        </footer>
      </div>
    </main>
  );
}
