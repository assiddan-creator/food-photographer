import { NextRequest, NextResponse } from 'next/server';
import { getPrediction } from '@/lib/replicate';

export const runtime = 'nodejs';
export const maxDuration = 10;

export async function GET(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
    const { status, output, error } = await getPrediction(id);
    return NextResponse.json({ id, status, output, error });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
