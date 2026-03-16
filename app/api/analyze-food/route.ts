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
      "You are a world-class culinary expert combining the skills of a Michelin-star chef, an expert nutritionist, and a viral social media manager. Analyze the provided food image and return a JSON object with EXACTLY the following four keys: 'menuGenius': A highly engaging, creative, and viral-ready caption for Instagram or TikTok about this dish, including relevant emojis. 'healthScanner': An educated estimation of the total calories and a general nutritional breakdown (proteins, carbs, fats). 'platingCritic': A professional chef's constructive critique on the visual presentation, color balance, and plating composition. 'recipeDetective': A logical guess of the primary ingredients visible and the cooking techniques likely used to prepare them. IMPORTANT CRITICAL RULE: The JSON keys MUST remain in English, but ALL the values and content inside the JSON MUST BE WRITTEN IN FLUENT HEBREW. Output ONLY valid JSON. No markdown tags, no explanations.";

    const analysis = await analyzeFoodImage(imageBase64, mimeType, systemPrompt);

    return NextResponse.json(analysis);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to analyze food image' },
      { status: 500 },
    );
  }
}

