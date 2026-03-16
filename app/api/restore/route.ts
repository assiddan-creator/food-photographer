import { NextRequest, NextResponse } from 'next/server';
import { startRestoration } from '@/lib/replicate';

export const runtime = 'nodejs';
export const maxDuration = 15;

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();
    if (!imageUrl) return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });
    const predictionId = await startRestoration(imageUrl);
    return NextResponse.json({ predictionId });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
