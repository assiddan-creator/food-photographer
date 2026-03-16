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
      'Analyze the uploaded food image. Preserve everything exactly as photographed. Apply the most commercially effective food photography enhancement based on the dish type. Improve lighting, color balance, texture clarity, and depth. Natural, realistic, appetizing result. No artistic interpretation. Looks professionally photographed for selling food. Shot on a Hasselblad X2D 100C medium format camera with a Hasselblad XCD 120mm f/3.5 Macro lens, using diffused side light, rule of thirds composition and intentional negative space.' +
      AUTHENTICITY_ANCHOR,
  },
  {
    id: 'marketing',
    title: 'פיצוץ שיווקי',
    image: '/Food_exploding_midair_ingredients_bdf383a9e6.jpeg',
    prompt:
      'Professional food advertising composition based on the uploaded image. Analyze the dish in the photo and transform it into a photorealistic action shot. The main dish dynamically explodes mid-air, with its key ingredients, textures, and garnishes bursting outward in multiple directions. Motion frozen at 1/8000 second shutter speed. Background is a cinematic dark studio setting with heavy bokeh. Apply ultra-detailed photorealistic textures, 8k UHD resolution, and razor-sharp focus. Professional advertising lighting with dramatic side-lighting. Shot on a Hasselblad X2D 100C medium format camera with a Hasselblad XCD 120mm f/3.5 Macro lens, composed with rule of thirds and controlled negative space for maximum impact. Everything must look natural, realistic, and appetizing for a high-end menu. No artistic interpretation, preserve the authentic identity of the food. Remove messy crumbs and clean plate edges.' +
      AUTHENTICITY_ANCHOR,
  },
  {
    id: 'split',
    title: 'תצוגה כפולה',
    image: '/Steak_dish_overhead_macro_b67f1558df.jpeg',
    prompt:
      'A professional food photography diptych, split screen. Left side: perfect overhead top-down view of the dish. Right side: extreme macro profile shot showing layers and texture. Studio lighting, cohesive background. Shot on a Hasselblad X2D 100C medium format camera with a Hasselblad XCD 120mm f/3.5 Macro lens, using diffused side light, rule of thirds and intentional negative space to separate the two frames.' +
      AUTHENTICITY_ANCHOR,
  },
  {
    id: 'menu',
    title: 'תפריט יוקרתי',
    image: '/Fine_dining_food_presentation_b4749bb336.jpeg',
    prompt:
      'Michelin star fine dining presentation. Dark moody lighting, high contrast, side-lit shadows, rustic dark background. Elegant minimalist styling. Remove messy crumbs, clean plate edges, boost crispness and juicy textures, keep the core food authentic. Shot on a Hasselblad X2D 100C medium format camera with a Hasselblad XCD 120mm f/3.5 Macro lens, emphasizing diffused side light, rule of thirds plating and sophisticated negative space like a Michelin guide photo.' +
      AUTHENTICITY_ANCHOR,
  },
  {
    id: 'delivery',
    title: 'משלוחים (וולט)',
    image: '/Food_photography_in_takeaway_box_3bfd93d74b.jpeg',
    prompt:
      'Commercial delivery app food photography, square composition, centered dish, highly vibrant colors, bright even studio lighting, clean minimal background, ultra-sharp detail, mouth-watering appetizing look. Shot on a Hasselblad X2D 100C medium format camera with a Hasselblad XCD 120mm f/3.5 Macro lens, using soft diffused side light, rule of thirds framing within the box and clean negative space for app thumbnails.' +
      AUTHENTICITY_ANCHOR,
  },
  {
    id: 'ingredients',
    title: 'פירוק מרכיבים',
    image: '/Commercial_food_photography_infographic_style_anal_669a6beeec.jpeg',
    prompt:
      'Commercial food photography infographic style. Analyze the uploaded dish and visually highlight its key ingredients with elegant, minimalist text labels pointing to them. Studio lighting, dark premium background. High-end culinary magazine editorial aesthetic. Shot on a Hasselblad X2D 100C medium format camera with a Hasselblad XCD 120mm f/3.5 Macro lens, using diffused side light, rule of thirds grid and generous negative space for the labels. CRITICAL: Preserve the uploaded food exactly as photographed. Do not add, remove, or invent any ingredients. No artistic interpretation of the food itself. Maintain 100% authenticity of the original dish.' +
      HEBREW_TYPOGRAPHY,
  },
  {
    id: 'nutrition',
    title: 'ערכים תזונתיים',
    image: '/Steak_with_nutritional_facts_ba0b2f7c78.jpeg',
    prompt:
      'High-end fitness and wellness food photography. Analyze the food and display a sleek, modern, floating digital text overlay with estimated macronutrients, calories, and nutritional facts next to the dish. Clean typography, premium dark athletic aesthetic, cinematic lighting. Shot on a Hasselblad X2D 100C medium format camera with a Hasselblad XCD 120mm f/3.5 Macro lens, with diffused side light, rule of thirds placement of text and controlled negative space around the plate. CRITICAL: Preserve the uploaded food exactly as photographed. Do not add, remove, or invent any ingredients. No artistic interpretation of the food itself. Maintain 100% authenticity of the original dish.' +
      HEBREW_TYPOGRAPHY,
  },
  {
    id: 'classic',
    title: 'קלאסי עילי',
    image: '/Steak_with_fries_explosion_6b69564913.jpeg',
    prompt:
      'Professional overhead shot, soft studio lighting, marble surface, shallow depth of field, sharp focus, magazine style. Shot on a Hasselblad X2D 100C medium format camera with a Hasselblad XCD 120mm f/3.5 Macro lens, perfectly balanced with diffused side light, rule of thirds composition and elegant negative space around the plate.' +
      AUTHENTICITY_ANCHOR,
  },
  {
    id: 'angle-45',
    title: 'זווית 45 (מנות גבוהות)',
    image: '/Steak_with_fries_explosion_6b69564913.jpeg',
    prompt:
      '45-degree angle diner\'s perspective food photography. Ideal for burgers, stacks, and tall dishes. Shot on a Hasselblad X2D 100C with XCD 120mm Macro lens. Diffused side window light. Rule of thirds, elegant depth of field highlighting the vertical layers. CRITICAL: Preserve the uploaded food exactly as photographed. Do not add, remove, or invent any ingredients. No artistic interpretation of the food itself. Maintain 100% authenticity of the original dish.',
  },
  {
    id: 'macro-asmr',
    title: 'מאקרו ASMR',
    image: '/Steak_dish_overhead_macro_b67f1558df.jpeg',
    prompt:
      'Extreme macro ASMR style food photography. Focus entirely on sensual textures, crisp crusts, cheese pulls, or glossy nappé sauces. Shot on a Hasselblad X2D 100C with XCD 120mm Macro lens at f/3.5 for razor-thin depth of field. Cinematic lighting. CRITICAL: Preserve the uploaded food exactly as photographed. Do not add, remove, or invent any ingredients. No artistic interpretation of the food itself. Maintain 100% authenticity of the original dish.',
  },
  {
    id: 'pov-social',
    title: 'POV (סושיאל)',
    image: '/Grilled_ribeye_steak_with_fries_a9d6150853.jpeg',
    prompt:
      'First-person POV "cook with me" or diner\'s perspective, highly popular on TikTok and Reels. Casual yet professional lighting. Shot on a Hasselblad X2D 100C. The dish is the focal point, inviting the viewer to take a bite. CRITICAL: Preserve the uploaded food exactly as photographed. Do not add, remove, or invent any ingredients. No artistic interpretation of the food itself. Maintain 100% authenticity of the original dish.',
  },
  {
    id: 'flat-lay',
    title: 'פלאט-ליי (צילום עילי)',
    image: '/Steak_dish_overhead_macro_b67f1558df.jpeg',
    prompt:
      'Perfect 90-degree flatlay overhead shot. Ideal for composed plates or boards. Shot on a Hasselblad X2D 100C. Diffused natural light from the side for depth. Clean, contrasting background, meticulous layout using the rule of thirds. CRITICAL: Preserve the uploaded food exactly as photographed. Do not add, remove, or invent any ingredients. No artistic interpretation of the food itself. Maintain 100% authenticity of the original dish.',
  },
  {
    id: 'minimal-michelin',
    title: 'מינימליזם (מישלן)',
    image: '/Fine_dining_food_presentation_b4749bb336.jpeg',
    prompt:
      'Ultra-minimalist nouvelle cuisine plating. Extreme use of negative space on a clean white or dark canvas canvas. Shot on a Hasselblad X2D 100C. Focus on a single quenelle or primary protein. Flawless garnish discipline. CRITICAL: Preserve the uploaded food exactly as photographed. Do not add, remove, or invent any ingredients. No artistic interpretation of the food itself. Maintain 100% authenticity of the original dish.',
  },
  {
    id: 'rustic',
    title: 'ראסטיק / כפרי',
    image: '/Closeup_street_food_money_shot_45degree_angle_extr_011a4690a6.jpeg',
    prompt:
      'Rustic artisan food photography. Warm, moody lighting. Textured background like aged wood or stone. Shot on a Hasselblad X2D 100C. Rich earthy color grading. CRITICAL: Preserve the uploaded food exactly as photographed. Do not add, remove, or invent any ingredients. No artistic interpretation of the food itself. Maintain 100% authenticity of the original dish.',
  },
  {
    id: 'brunch-morning',
    title: 'בראנץ׳ / אור בוקר',
    image: '/Steak_with_nutritional_facts_ba0b2f7c78.jpeg',
    prompt:
      'Bright, airy golden hour morning light. Fresh, vibrant, lifestyle aesthetic. Diffused sunlight casting soft long shadows. Shot on a Hasselblad X2D 100C. High-key lighting, appetizing and energizing color palette. CRITICAL: Preserve the uploaded food exactly as photographed. Do not add, remove, or invent any ingredients. No artistic interpretation of the food itself. Maintain 100% authenticity of the original dish.',
  },
  {
    id: 'chef-table-dramatic',
    title: 'שולחן השף (דרמטי)',
    image: '/Extreme_out_of_focus_background_of_a_highend_dark__dfb3863541.jpeg',
    prompt:
      "Moody dramatic chef's pass. High contrast, directional spotlighting mimicking a high-end restaurant kitchen. Deep shadows, glowing highlights on the food. Shot on a Hasselblad X2D 100C. CRITICAL: Preserve the uploaded food exactly as photographed. Do not add, remove, or invent any ingredients. No artistic interpretation of the food itself. Maintain 100% authenticity of the original dish.",
  },
] as const;

const PRESET_DESCRIPTIONS: Record<string, string> = {
  auto:
    'שיפור חכם ואוטומטי שנראה כאילו צולם בסטודיו מקצועי – בלי לשנות את המנה עצמה.',
  marketing:
    'קומפוזיציית פרסום דרמטית ומוכרת, עם אנרגיה של קמפיין וידאו לברים ומסעדות.',
  split:
    'תצוגה כפולה של המנה – צילום עילי מושלם לצד קלוז-אפ טקסטורות מעורר תיאבון.',
  menu:
    'אסתטיקה של תפריט מסעדת מישלן – קומפוזיציה נקייה, תאורה דרמטית ותחושת יוקרה.',
  delivery:
    'ויז׳ואל אופטימלי לאפליקציות משלוחים – צבעים חזקים, מרכז חד וברור ורקע נקי.',
  ingredients:
    'פירוק מרכיבים אינפוגרפי – הדגשת רכיבים מרכזיים עם תחושת מגזין קולינרי.',
  nutrition:
    'לוק של בריאות וכושר – הצגת ערכים תזונתיים באופן אלגנטי ומקצועי.',
  classic:
    'צילום עילי קלאסי למנות עיקריות – זווית מוכרת שמדגישה צלחת יפה ופירוט עדין.',
  'angle-45':
    'זווית 45° למנות גבוהות – מושלם להמבורגרים, טוסטים ושכבות מרשימות.',
  'macro-asmr':
    'מאקרו טקסטורות ברמת ASMR – קריספיות, רטיבות, גלייזים וסטרצ׳ים של גבינה.',
  'pov-social':
    'זווית POV כאילו הצופה יושב מול הצלחת – מושלם לסטוריז וסרטוני אכילה.',
  'flat-lay':
    'פלאט-ליי עילי מושלם ללוחות, בראנצים ומנות מחולקות באופן אסתטי.',
  'minimal-michelin':
    'מינימליזם קפדני בסגנון מישלן – הרבה חלל ריק ופוקוס על אלמנט מרכזי אחד.',
  rustic:
    'סגנון ראסטיק כפרי – משטחים מחוספסים, תאורה חמימה וטקסטורות עמוקות.',
  'brunch-morning':
    'אור בוקר רך לבראנץ׳ – וייב קליל, זוהר, מושלם לרשתות חברתיות.',
  'chef-table-dramatic':
    'שולחן פס דרמטי של שף – תאורה ממוקדת, צללים עמוקים ואווירה מקצועית.',
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

  const isRunning = stage === 'generating';
  const selectedPreset = PRESETS[selectedIndex];

  const handleReset = () => {
    // Back to style selection, keep uploaded image
    reset();
  };

  const handleGenerate = () => {
    if (base64 && selectedPreset) run(base64, selectedPreset.prompt, aspectRatio, selectedModel);
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
      setAnalysisResult(data as {
        menuGenius: string;
        healthScanner: string;
        platingCritic: string;
        recipeDetective: string;
      });
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

      <div className="relative z-10 max-w-5xl mx-auto space-y-10">
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-lg border border-white/10 text-white text-sm font-medium">
            <Sparkles size={13} /> Assi &amp; Johnny Photobooth AI
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            סטודיו פרימיום לתמונות אוכל חכמות
          </h1>
          <p className="text-white/45 text-sm md:text-base max-w-2xl mx-auto">
            העלה צילום אמיתי של המנה, בחר מצב יצירתי – וקבל תמונה שמוכרת + ניתוח חכם של שף, תזונאי
            ויוצר תוכן, הכל במקום אחד.
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
              className="space-y-10"
            >
              <section className="space-y-4">
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <p className="text-white/60 text-xs font-semibold uppercase tracking-[0.2em]">
                      שלב 1 · מצב יצירתי
                    </p>
                    <p className="text-white text-sm mt-1">
                      בחר את המוד / סגנון הצילום שאתה רוצה לתת למנה.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[280px] overflow-y-auto pr-1">
                  {PRESETS.map((preset, index) => {
                    const isSelected = selectedIndex === index;
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
                        onClick={() => {
                          if (isRunning) return;
                          setSelectedIndex(index);
                          // If a result is currently shown, return to the style view so the change is visible
                          if (stage === 'done') {
                            reset();
                          }
                        }}
                        disabled={isRunning}
                        whileHover={!isRunning ? { scale: 1.02 } : {}}
                        whileTap={!isRunning ? { scale: 0.98 } : {}}
                        aria-pressed={isSelected}
                        className={`relative rounded-xl p-4 text-right border min-h-[96px] flex flex-col justify-center transition-all duration-200 text-white bg-white/5 backdrop-blur-lg overflow-hidden ${borderClass} ${isRunning ? 'opacity-60 pointer-events-none' : ''}`}
                      >
                        <div
                          className="absolute inset-0 bg-cover bg-center opacity-30"
                          style={{ backgroundImage: `url('${preset.image}')` }}
                          aria-hidden
                        />
                        <span className="relative font-semibold text-sm flex items-center gap-1.5">
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
              </section>

              <section className="grid md:grid-cols-2 gap-8 items-start">
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
                  <div className="rounded-2xl p-5 flex-1 flex flex-col justify-center bg-white/5 backdrop-blur-lg border border-white/10 text-white text-right">
                    <p className="text-white/50 text-[11px] mb-1 tracking-[0.2em] uppercase">
                      מצב יצירתי נבחר
                    </p>
                    <p className="font-semibold text-sm">{selectedPreset.title}</p>
                    <p className="text-white/50 text-xs mt-2">
                      {PRESET_DESCRIPTIONS[selectedPreset.id] ?? selectedPreset.title}
                    </p>
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

                    <div className="grid sm:grid-cols-2 gap-3">
                      <motion.button
                        whileHover={!isRunning && base64 ? { scale: 1.02 } : {}}
                        whileTap={!isRunning && base64 ? { scale: 0.97 } : {}}
                        onClick={handleGenerate}
                        disabled={isRunning || !base64}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/30 shadow-[0_0_24px_rgba(0,0,0,0.55)]"
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
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-emerald-400/40 shadow-[0_0_18px_rgba(16,185,129,0.45)]"
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

                  <p className="text-center text-white/45 text-xs">
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
              </section>
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
                <p
                  className="text-sm text-white/80 whitespace-pre-wrap font-sans text-right"
                  dir="rtl"
                >
                  {analysisResult.menuGenius}
                </p>
              </GlassCard>
              <GlassCard className="p-4 bg-white/5 border border-white/10 text-white space-y-2">
                <p className="text-xs uppercase tracking-wide text-orange-300 font-semibold">
                  ערכים תזונתיים
                </p>
                <p
                  className="text-sm text-white/80 whitespace-pre-wrap font-sans text-right"
                  dir="rtl"
                >
                  {analysisResult.healthScanner}
                </p>
              </GlassCard>
              <GlassCard className="p-4 bg-white/5 border border-white/10 text-white space-y-2">
                <p className="text-xs uppercase tracking-wide text-sky-300 font-semibold">
                  ביקורת שף
                </p>
                <p
                  className="text-sm text-white/80 whitespace-pre-wrap font-sans text-right"
                  dir="rtl"
                >
                  {analysisResult.platingCritic}
                </p>
              </GlassCard>
              <GlassCard className="p-4 bg-white/5 border border-white/10 text-white space-y-2">
                <p className="text-xs uppercase tracking-wide text-violet-300 font-semibold">
                  סודות המטבח
                </p>
                <p
                  className="text-sm text-white/80 whitespace-pre-wrap font-sans text-right"
                  dir="rtl"
                >
                  {analysisResult.recipeDetective}
                </p>
              </GlassCard>
            </div>
          </div>
        )}

        <footer className="text-center pt-4 pb-2">
          <p className="text-white/30 text-xs">
            Powered by Nano Banana 2 + CodeFormer.
          </p>
        </footer>
      </div>
    </main>
  );
}
