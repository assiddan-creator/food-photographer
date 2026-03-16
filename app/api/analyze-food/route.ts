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

    const systemPrompt =
      "You are a friendly, expert Israeli chef explaining things to an amateur cook in spoken, natural Hebrew slang. Analyze the food image and return a JSON object with EXACTLY four keys: 'menuGenius', 'healthScanner', 'platingCritic', 'recipeDetective'. \nCRITICAL RULES FOR CONTENT:\n1. 'recipeDetective': Briefly identify the dish, but focus 80% of the text on 1-2 'Pro Chef Secrets' (סודות של שפים). Do NOT give a standard recipe. Give advanced, unique culinary hacks to elevate this specific dish to Michelin-star level (e.g., secret ingredient ratios, specific temperature control, or chemical reactions like baking soda in falafel).\n2. 'healthScanner': Give caloric and macro estimates simply. CRITICAL: NEVER include any medical disclaimers (e.g., 'this is not medical advice', 'consult a doctor').\nCRITICAL RULES FOR FORMATTING:\n3. The 4 JSON keys MUST remain in English. \n4. The VALUES MUST BE IN FLUENT, SPOKEN HEBREW ONLY. \n5. Return only plain Hebrew strings for the values without any English words, markdown, or JSON artifacts.";

    const analysis = await analyzeFoodImage(imageBase64, mimeType, systemPrompt);

    return NextResponse.json(analysis);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to analyze food image' },
      { status: 500 },
    );
  }
}

