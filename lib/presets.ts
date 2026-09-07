export const AUTHENTICITY_ANCHOR =
  ' CRITICAL: Preserve the uploaded food exactly as photographed. Do not add, remove, or invent any ingredients. No artistic interpretation of the food itself. Maintain 100% authenticity of the original dish.';

export const WOLT_ENHANCE_RULES =
  ' Horizontal 16:9 landscape. Entire dish visible and centered — do not crop plate edges. Bright natural daylight. Realistic portion size. Food only, no people. No text, logos, graphics, borders, or watermarks. Enhance the real photo only — do not invent a cinematic or fully AI-generated look.';

const HEBREW_TYPOGRAPHY =
  ' Use clean, modern Hebrew typography for all text labels. Ensure letters are not reversed.';

const CINEMA_CAMERA_SUFFIX =
  '. Shot on ARRI Alexa 65 cinema camera with an ARRI/Zeiss Master Prime 50mm T1.3 lens. Adaptive cinematic lighting that perfectly matches the described environment while maintaining appetizing highlights, rich textures, and commercial food styling on the main dish. 8k resolution, ultra-photorealistic. CRITICAL: Preserve the uploaded food exactly as photographed. Do not add, remove, or invent any ingredients. No artistic interpretation of the food itself. Maintain 100% authenticity of the original dish.';

export const PRESETS = [
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
    title: 'משלוחים (וולט) / מוכן לוולט',
    image: '/Food_photography_in_takeaway_box_3bfd93d74b.jpeg',
    prompt:
      'Enhance this real photographed dish for a Wolt / delivery-app listing. Horizontal 16:9 landscape only. Keep the entire dish fully visible and centered — do not crop plate or food edges. Bright, even, natural daylight. Realistic portion size — do not enlarge, multiply, restyle, or glamorize the serving. Food only: no people, no hands, no faces. Clean table, no extra props that change the dish. Do not add text, logos, graphics, borders, frames, watermarks, labels, or UI chrome. Do not create a cinematic, exploding, or advertising composite. Gentle color and light correction of the original photo only — it must still look like a real photograph, not an AI-generated image. High clarity, sharp but natural detail.' +
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

export type Preset = (typeof PRESETS)[number];
export type PresetId = Preset['id'];
export type CategoryId = 'classics' | 'studio' | 'cinema' | 'social-ai';

export const CATEGORY_PRESETS: Record<CategoryId, readonly PresetId[]> = {
  classics: ['auto', 'menu', 'delivery', 'classic'],
  studio: ['marketing', 'split', 'ingredients', 'nutrition'],
  cinema: ['cinematic-cut', 'cyberpunk', 'retro-film', 'live-fire'],
  'social-ai': ['paparazzi-flash', 'zero-gravity', 'pov-action', 'ai-director'],
};

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  classics: 'הקלאסיים',
  studio: 'סטודיו ופרסום',
  cinema: 'סינמטוגרפיה',
  'social-ai': 'סושיאל ו-AI',
};

/** Enhance-only classics that stay honest for a restaurant menu pack. */
export const SAFE_BATCH_PRESET_IDS = ['auto', 'delivery', 'menu', 'classic'] as const;
export type SafeBatchPresetId = (typeof SAFE_BATCH_PRESET_IDS)[number];

export const WOLT_PRESET_ID = 'delivery' satisfies PresetId;
export const BATCH_MAX_IMAGES = 10;
export const BATCH_SECONDS_PER_IMAGE_MIN = 5;
export const BATCH_SECONDS_PER_IMAGE_MAX = 10;

export function getPresetById(id: PresetId): Preset {
  const preset = PRESETS.find(item => item.id === id);
  if (!preset) {
    throw new Error(`Unknown preset: ${id}`);
  }
  return preset;
}

export function isSafeBatchPreset(id: PresetId): id is SafeBatchPresetId {
  return (SAFE_BATCH_PRESET_IDS as readonly string[]).includes(id);
}

export function buildGeneratePrompt(
  preset: Preset,
  customPrompt: string,
  platingCritic?: string | null,
): string {
  if (customPrompt.trim() !== '') {
    return preset.id === 'delivery'
      ? customPrompt.trim() + '.' + WOLT_ENHANCE_RULES + AUTHENTICITY_ANCHOR
      : customPrompt.trim() + CINEMA_CAMERA_SUFFIX;
  }

  let prompt = preset.prompt;
  if (preset.id === 'ai-director' && platingCritic) {
    prompt = prompt.replace('[AI_CRITIQUE_PLACEHOLDER]', platingCritic);
  }
  return prompt;
}
