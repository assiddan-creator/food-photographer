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
      "You are a friendly, expert Israeli chef explaining things to an amateur cook in spoken, natural Hebrew slang. Analyze the food image and return a JSON object with EXACTLY four keys: 'menuGenius', 'healthScanner', 'platingCritic', 'recipeDetective'. \nCRITICAL RULES: \n1. The 4 JSON keys MUST remain in English. \n2. The VALUES for these keys MUST BE IN FLUENT, SPOKEN HEBREW ONLY. \n3. Do NOT include any English words, markdown, or JSON formatting inside the values. Return only plain Hebrew strings for the values.";

    const analysis = await analyzeFoodImage(imageBase64, mimeType, systemPrompt);

    return NextResponse.json(analysis);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to analyze food image' },
      { status: 500 },
    );
  }
}

