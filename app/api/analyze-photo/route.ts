import { NextRequest, NextResponse } from 'next/server';
import { analyzePhotoQuality } from '@/lib/gemini';
import { splitImagePayload } from '@/lib/photo-qa';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const imageValue =
      typeof body.imageBase64 === 'string'
        ? body.imageBase64
        : typeof body.image === 'string'
          ? body.image
          : '';

    if (!imageValue) {
      return NextResponse.json({ error: 'imageBase64 is required' }, { status: 400 });
    }

    const split = splitImagePayload(imageValue);
    const mimeType =
      typeof body.mimeType === 'string' && body.mimeType.trim()
        ? body.mimeType.trim()
        : split.mimeType;

    const result = await analyzePhotoQuality(split.base64, mimeType);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to analyze photo quality' },
      { status: 500 },
    );
  }
}
