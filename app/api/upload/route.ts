import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { source, folder } = await request.json();
    if (!source) return NextResponse.json({ error: 'No image source provided' }, { status: 400 });

    // Guard: estimate size from base64 length
    const estimatedMB = (source.length * 0.75) / (1024 * 1024);
    if (estimatedMB > 10) {
      return NextResponse.json(
        { error: `Image too large: ~${estimatedMB.toFixed(1)}MB. Compress first.` },
        { status: 413 }
      );
    }

    const result = await uploadToCloudinary(source, folder ?? 'food-photographer');
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
