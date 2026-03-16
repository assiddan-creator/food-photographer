import { NextRequest, NextResponse } from 'next/server';
import { startGeneration } from '@/lib/replicate';

export const runtime = 'nodejs';
export const maxDuration = 15;

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, prompt } = await request.json();
    if (!imageUrl || !prompt) {
      return NextResponse.json({ error: 'imageUrl and prompt are required' }, { status: 400 });
    }
    const predictionId = await startGeneration(imageUrl, prompt);
    return NextResponse.json({ predictionId });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
