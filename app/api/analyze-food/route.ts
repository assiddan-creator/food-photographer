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
      "You are a Michelin-star chef-mentor, an expert nutritionist, and a viral social media director. Analyze the food image and return a JSON with EXACTLY four keys: 'menuGenius': Write a viral TikTok/Reels caption with a strong 1-2 second text hook (tension/payoff), avoid emoji spam, and provide a 3-bullet cinematic 'shot list' (e.g., macro close-ups, 45-degree angles, lighting/editing directions). 'healthScanner': Educated estimation of calories and macronutrients. 'platingCritic': Critique composition using fine-dining terms like 'negative space', 'rule of thirds', 'quenelle', 'nappé', or 'Maillard reaction'. Provide practical fixes to elevate the dish visually for high-conversion delivery menus. 'recipeDetective': Guess primary ingredients and advanced cooking techniques used. IMPORTANT CRITICAL RULE: The JSON keys MUST remain in English, but ALL the values and content inside the JSON MUST BE WRITTEN IN FLUENT, PROFESSIONAL HEBREW. Output ONLY valid JSON. No markdown.";

    const analysis = await analyzeFoodImage(imageBase64, mimeType, systemPrompt);

    return NextResponse.json(analysis);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to analyze food image' },
      { status: 500 },
    );
  }
}

