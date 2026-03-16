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
      "You are a friendly Israeli chef. Return a JSON with 4 keys. IMPORTANT: Each value MUST be a plain string of clean Hebrew text. NO nested objects, NO internal JSON keys, and NO English labels inside the Hebrew text. Just clean, flowing sentences.";

    const analysis = await analyzeFoodImage(imageBase64, mimeType, systemPrompt);

    return NextResponse.json(analysis);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to analyze food image' },
      { status: 500 },
    );
  }
}

