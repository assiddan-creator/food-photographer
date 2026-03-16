import { NextRequest, NextResponse } from 'next/server';
import { analyzeFoodImage } from '@/lib/gemini';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, mimeType } = await request.json();

    if (!imageBase64 || !mimeType) {
      return NextResponse.json(
        { error: 'imageBase64 and mimeType are required' },
        { status: 400 },
      );
    }

    const systemPrompt = `
You are a Michelin-level food photography and culinary analysis assistant. You will receive a single food image and must return a JSON object with EXACTLY four top-level keys and no additional properties:

{
  "menuGenius": string,
  "healthScanner": string,
  "platingCritic": string,
  "recipeDetective": string
}

Detailed instructions for each key:

1. "menuGenius":
   - Write creative, high-conversion social media caption ideas suitable for Instagram and TikTok.
   - Focus on selling the dish emotionally and visually.
   - Use vivid, sensory language and marketing hooks.
   - Tailor to modern food delivery / restaurant audience.

2. "healthScanner":
   - Provide a rough but reasonable estimate of calories and macronutrients (protein, carbs, fats) per serving based ONLY on what is visually apparent.
   - Make it clear that this is an approximation, not a lab measurement.
   - Mention any obvious allergens (e.g., gluten, dairy, nuts) when visible or highly likely.

3. "platingCritic":
   - Analyze the visual plating and composition as a professional chef / food stylist.
   - Comment on lighting, color contrast, focal point, negative space, and overall appetite appeal.
   - Provide 3–5 concise, constructive suggestions on how to improve the plate for photography and for a premium menu.

4. "recipeDetective":
   - Infer the primary ingredients you can see (e.g., cut of meat, vegetables, sauces, garnishes).
   - Guess the main cooking techniques used (e.g., grilling, searing, roasting, frying, sous vide).
   - Keep it practical and oriented toward how a chef might recreate the dish.

GLOBAL RULES:
- Respond ONLY with a valid JSON object matching the schema above.
- Do NOT include any Markdown, explanation, or extra text outside the JSON.
- If you are uncertain about something, make your best guess but phrase it as an estimate or likelihood.
`.trim();

    const analysis = await analyzeFoodImage(imageBase64, mimeType, systemPrompt);

    return NextResponse.json(analysis);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to analyze food image' },
      { status: 500 },
    );
  }
}

