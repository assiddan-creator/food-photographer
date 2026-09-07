export const AUTHENTICITY_ANCHOR =
  ' CRITICAL: Preserve the uploaded food exactly as photographed. Do not add, remove, or invent any ingredients. No artistic interpretation of the food itself. Maintain 100% authenticity of the original dish.';

/** For explode / zero-g / hands-POV: keep the dish, allow controlled stylization. */
export const STYLIZED_IDENTITY_ANCHOR =
  ' Preserve the core identity of the uploaded dish — same proteins, sides, sauces, and recognizable character. Controlled stylization of camera, motion, composition, and atmosphere is allowed. Do not replace the dish with a different meal or invent unrelated ingredients.';

export const WOLT_ENHANCE_RULES =
  ' Horizontal 16:9 landscape. Entire dish visible and centered — do not crop plate edges. Bright natural daylight. Realistic portion size. Food only, no people. No text, logos, graphics, borders, or watermarks. Enhance the real photo only — do not invent a cinematic or fully AI-generated look.';

export const TIKTOK_ENHANCE_RULES =
  ' Vertical 9:16 portrait only. Entire dish visible and centered — do not crop plate or cake edges. Bright natural daylight. Realistic home-kitchen portion. Food only, no people. No text, logos, graphics, borders, or watermarks. Enhance the real photo only — do not invent a cinematic or fully AI-generated look.';

const CINEMA_CAMERA_SUFFIX =
  '. Shot on ARRI Alexa 65 cinema camera with an ARRI/Zeiss Master Prime 50mm T1.3 lens. Adaptive cinematic lighting that perfectly matches the described environment while maintaining appetizing highlights, rich textures, and commercial food styling on the main dish. 8k resolution, ultra-photorealistic. CRITICAL: Preserve the uploaded food exactly as photographed. Do not add, remove, or invent any ingredients. No artistic interpretation of the food itself. Maintain 100% authenticity of the original dish.';

export const AI_CRITIQUE_PLACEHOLDER = '[AI_CRITIQUE_PLACEHOLDER]';

const AI_DIRECTOR_FALLBACK_CRITIQUE =
  'No separate chef notes were provided. Apply a strong restaurant enhance: tighten plating, clean the plate rim, boost texture and juiciness, improve lighting and color balance, and keep the same dish identity. Photorealistic Michelin-star execution.';

export const PRESETS = [
  {
    id: 'auto',
    title: 'שיפור אוטומטי',
    image: '/Grilled_ribeye_steak_with_fries_a9d6150853.jpeg',
    prompt:
      'Analyze the uploaded food image. Preserve everything exactly as photographed. Apply the most commercially effective food photography enhancement based on the dish type. Improve lighting, color balance, texture clarity, and depth. Natural, realistic, appetizing result. No artistic interpretation. Looks professionally photographed for selling food.' +
      AUTHENTICITY_ANCHOR,
  },
  {
    id: 'marketing',
    title: 'פרסום דרמטי',
    image: '/Grilled_ribeye_steak_with_fries_a9d6150853.jpeg',
    prompt:
      'Professional food advertising composition based on the uploaded image. Transform the real dish into a photorealistic action shot: the main dish dynamically explodes mid-air, with its key ingredients, textures, and garnishes bursting outward. Motion frozen at 1/8000 second shutter speed. Cinematic dark studio background with heavy bokeh. Ultra-detailed photorealistic textures, 8k UHD, razor-sharp focus. Dramatic side-lighting. Keep the result appetizing for a high-end menu. Remove messy crumbs and clean plate edges. The exploded pieces must still be the same dish from the photo.' +
      STYLIZED_IDENTITY_ANCHOR,
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
    title: 'תפריט מסעדה',
    image: '/Grilled_ribeye_steak_with_fries_a9d6150853.jpeg',
    prompt:
      'Michelin star fine dining presentation. Dark moody lighting, high contrast, side-lit shadows, rustic dark background. Elegant minimalist styling. Remove messy crumbs, clean plate edges, boost crispness and juicy textures, keep the core food authentic.' +
      AUTHENTICITY_ANCHOR,
  },
  {
    id: 'delivery',
    title: 'מוכן לוולט',
    image: '/Grilled_ribeye_steak_with_fries_a9d6150853.jpeg',
    prompt:
      'Enhance this real photographed dish for a Wolt / delivery-app listing. Horizontal 16:9 landscape only. Keep the entire dish fully visible and centered — do not crop plate or food edges. Bright, even, natural daylight. Realistic portion size — do not enlarge, multiply, restyle, or glamorize the serving. Food only: no people, no hands, no faces. Clean table, no extra props that change the dish. Do not add text, logos, graphics, borders, frames, watermarks, labels, or UI chrome. Do not create a cinematic, exploding, or advertising composite. Gentle color and light correction of the original photo only — it must still look like a real photograph, not an AI-generated image. High clarity, sharp but natural detail.' +
      AUTHENTICITY_ANCHOR,
  },
  {
    id: 'tiktok',
    title: 'מוכן לסטורי',
    image: '/Grilled_ribeye_steak_with_fries_a9d6150853.jpeg',
    prompt:
      'Enhance this real photographed dish for TikTok, Instagram Stories, and Reels. Vertical 9:16 portrait only. Keep the entire dish, cake, or bake fully visible and centered — do not crop plate, cake, or food edges. Bright, even, natural daylight that suits a home kitchen or bakery. Realistic portion size — do not enlarge, multiply, restyle, or glamorize the serving. Food only: no people, no hands, no faces. Clean table or counter, no extra props that change the dish. Do not add text, logos, graphics, borders, frames, watermarks, labels, stickers, or UI chrome. Do not create a cinematic, exploding, or advertising composite. Gentle color and light correction of the original photo only — it must still look like a real photograph, not an AI-generated image. High clarity, sharp but natural detail. Ready for a food creator, home baker, or cake maker.' +
      AUTHENTICITY_ANCHOR,
  },
  {
    id: 'ingredients',
    title: 'פירוק מרכיבים (ניסיוני)',
    image: '/Commercial_food_photography_infographic_style_anal_669a6beeec.jpeg',
    prompt:
      'Commercial food photography with subtle ingredient callouts only. Place 2–4 short English labels (one or two words each, e.g. Steak, Fries) with thin leader lines pointing to the main components of the uploaded dish. No paragraphs, no Hebrew text, no dense infographic, no magazine masthead. Studio lighting, dark premium background. Keep the dish itself photorealistic and unchanged except for the small labels.' +
      STYLIZED_IDENTITY_ANCHOR,
  },
  {
    id: 'nutrition',
    title: 'ערכים תזונתיים (ניסיוני)',
    image: '/Steak_with_nutritional_facts_ba0b2f7c78.jpeg',
    prompt:
      'High-end wellness food photography with a subtle overlay of 3–4 short English macros only (e.g. Protein, Carbs, Fat, kcal) as small callouts beside the dish. No Hebrew text, no long nutritional tables, no dense UI, no glowing panels. Clean minimal typography, dark athletic aesthetic. Keep the dish photorealistic and recognizable.' +
      STYLIZED_IDENTITY_ANCHOR,
  },
  {
    id: 'classic',
    title: 'קלאסי עילי',
    image: '/Grilled_ribeye_steak_with_fries_a9d6150853.jpeg',
    prompt:
      'Professional overhead top-down shot of the plated dish, soft even studio lighting, light marble or stone surface, shallow depth of field, sharp focus on the food, clean magazine style. The whole plate is visible. No explosion, no floating ingredients, no text.' +
      AUTHENTICITY_ANCHOR,
  },
  {
    id: 'cinematic-cut',
    title: 'קאט קולנועי',
    image: '/Fine_dining_food_presentation_b4749bb336.jpeg',
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
    image: '/Fine_dining_food_presentation_b4749bb336.jpeg',
    prompt:
      'Nostalgic 35mm film photography, Kodak Portra 400 emulation, natural grain, subtle light leaks, warm retro color grading.' +
      AUTHENTICITY_ANCHOR,
  },
  {
    id: 'live-fire',
    title: 'גריל ועשן',
    image: '/Grilled_ribeye_steak_with_fries_a9d6150853.jpeg',
    prompt:
      'Dynamic live-fire cooking aesthetic. Flying embers, thick smoke, intense Maillard reaction visible. Dramatic warm backlighting.' +
      AUTHENTICITY_ANCHOR,
  },
  {
    id: 'paparazzi-flash',
    title: 'פלאש פפראצי',
    image: '/Grilled_ribeye_steak_with_fries_a9d6150853.jpeg',
    prompt:
      'Trendy UGC direct flash photography, hard shadows, high contrast, 90s disposable camera aesthetic. Raw, authentic, viral Instagram style. The dish stays on the plate — lighting and flash only, no explosion.' +
      AUTHENTICITY_ANCHOR,
  },
  {
    id: 'zero-gravity',
    title: 'אפס כבידה',
    image: '/Food_exploding_midair_ingredients_bdf383a9e6.jpeg',
    prompt:
      'Surreal zero-gravity food photography. Key ingredients of this same dish gracefully floating in mid-air in ultra slow-motion. High-speed sync flash, dark studio background.' +
      STYLIZED_IDENTITY_ANCHOR,
  },
  {
    id: 'pov-action',
    title: 'גוף ראשון',
    image: '/Closeup_street_food_money_shot_45degree_angle_extr_011a4690a6.jpeg',
    prompt:
      'First-person POV action shot. Hands may enter the frame to interact with this same dish (pouring sauce, cutting, lifting a bite). Motion blur on movement, razor-sharp focus on the food. Keep the dish recognizable.' +
      STYLIZED_IDENTITY_ANCHOR,
  },
  {
    id: 'ai-director',
    title: 'בימוי חכם (AI Director)',
    image: '/Fine_dining_food_presentation_b4749bb336.jpeg',
    prompt:
      `Reconstruct and elevate this exact dish by strictly applying the following professional chef's critique: ${AI_CRITIQUE_PLACEHOLDER}. Photorealistic Michelin-star execution.` +
      AUTHENTICITY_ANCHOR,
  },
] as const;

export type Preset = (typeof PRESETS)[number];
export type PresetId = Preset['id'];
export type CategoryId = 'classics' | 'creators' | 'studio' | 'cinema' | 'social-ai';

export const CATEGORY_PRESETS: Record<CategoryId, readonly PresetId[]> = {
  classics: ['auto', 'menu', 'delivery', 'classic'],
  creators: ['tiktok'],
  studio: ['marketing', 'split'],
  cinema: ['cinematic-cut', 'cyberpunk', 'retro-film', 'live-fire'],
  'social-ai': [
    'paparazzi-flash',
    'zero-gravity',
    'pov-action',
    'ai-director',
    'ingredients',
    'nutrition',
  ],
};

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  classics: 'הקלאסיים',
  creators: 'סטורי / טיקטוק',
  studio: 'סטודיו ופרסום',
  cinema: 'סינמטוגרפיה',
  'social-ai': 'סושיאל ו-AI',
};

/** Single-dish default path — six photo-first cards before «עוד סגנונות». */
export const PRIMARY_PRESET_IDS = [
  'delivery',
  'tiktok',
  'menu',
  'auto',
  'marketing',
  'classic',
] as const;
export type PrimaryPresetId = (typeof PRIMARY_PRESET_IDS)[number];

export function isPrimaryPreset(id: PresetId): id is PrimaryPresetId {
  return (PRIMARY_PRESET_IDS as readonly string[]).includes(id);
}

export type StyleFilterId = 'all' | 'delivery' | 'social' | 'restaurant';

export const STYLE_FILTERS: ReadonlyArray<{
  id: StyleFilterId;
  label: string;
  presetIds: readonly PrimaryPresetId[];
}> = [
  { id: 'all', label: 'הכל', presetIds: PRIMARY_PRESET_IDS },
  { id: 'delivery', label: 'משלוחים', presetIds: ['delivery'] },
  { id: 'social', label: 'סושיאל', presetIds: ['tiktok', 'marketing'] },
  { id: 'restaurant', label: 'מסעדה', presetIds: ['menu', 'auto', 'classic'] },
];

/** Extra catalog presets shown under «עוד סגנונות» for a filter (null = all remaining). */
export const MORE_STYLE_FILTER_IDS: Record<StyleFilterId, readonly PresetId[] | null> = {
  all: null,
  delivery: [],
  social: [
    'paparazzi-flash',
    'zero-gravity',
    'pov-action',
    'ai-director',
    'ingredients',
    'nutrition',
  ],
  restaurant: ['split', 'cinematic-cut', 'cyberpunk', 'retro-film', 'live-fire'],
};

/** Text-overlay styles — Fal often garbles letters; treat as experimental. */
export const EXPERIMENTAL_PRESET_IDS = ['ingredients', 'nutrition'] as const;

/** Enhance-only styles that stay honest for a restaurant or creator pack. */
export const SAFE_BATCH_PRESET_IDS = ['auto', 'delivery', 'tiktok', 'menu', 'classic'] as const;
export type SafeBatchPresetId = (typeof SAFE_BATCH_PRESET_IDS)[number];

export const WOLT_PRESET_ID = 'delivery' satisfies PresetId;
export const TIKTOK_PRESET_ID = 'tiktok' satisfies PresetId;
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

export function isExperimentalPreset(id: PresetId): boolean {
  return (EXPERIMENTAL_PRESET_IDS as readonly string[]).includes(id);
}

export function getCategoryForPreset(id: PresetId): CategoryId {
  for (const category of Object.keys(CATEGORY_PRESETS) as CategoryId[]) {
    if ((CATEGORY_PRESETS[category] as readonly PresetId[]).includes(id)) {
      return category;
    }
  }
  throw new Error(`Preset ${id} is not assigned to a category`);
}

/** Business / creator packs that force a Fal aspect instead of the source photo. */
export function forcedAspectForPreset(id: PresetId): '16:9' | '9:16' | null {
  if (id === WOLT_PRESET_ID) return '16:9';
  if (id === TIKTOK_PRESET_ID) return '9:16';
  return null;
}

/**
 * Custom-prompt routing:
 * - Wolt → Wolt 16:9 rules + authenticity
 * - TikTok → TikTok 9:16 rules + authenticity
 * - cinema category → ARRI cinema suffix
 * - classics / studio / social-ai / other enhance → authenticity only (never cinema)
 */
export function buildGeneratePrompt(
  preset: Preset,
  customPrompt: string,
  platingCritic?: string | null,
): string {
  if (customPrompt.trim() !== '') {
    const custom = customPrompt.trim();
    if (preset.id === WOLT_PRESET_ID) {
      return custom + '.' + WOLT_ENHANCE_RULES + AUTHENTICITY_ANCHOR;
    }
    if (preset.id === TIKTOK_PRESET_ID) {
      return custom + '.' + TIKTOK_ENHANCE_RULES + AUTHENTICITY_ANCHOR;
    }
    if (getCategoryForPreset(preset.id) === 'cinema') {
      return custom + CINEMA_CAMERA_SUFFIX;
    }
    return custom + AUTHENTICITY_ANCHOR;
  }

  let prompt = preset.prompt;
  if (preset.id === 'ai-director') {
    const critique = platingCritic?.trim() || AI_DIRECTOR_FALLBACK_CRITIQUE;
    prompt = prompt.replace(AI_CRITIQUE_PLACEHOLDER, critique);
  }
  return prompt;
}
