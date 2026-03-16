import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const FAL_ENDPOINT = 'https://fal.run/fal-ai/flux/dev/image-to-image';

export async function POST(request: NextRequest) {
  try {
    const { image, prompt } = await request.json();
    if (!image || !prompt) {
      return NextResponse.json(
        { error: 'image and prompt are required' },
        { status: 400 }
      );
    }

    const key = process.env.FAL_KEY;
    if (!key) {
      return NextResponse.json(
        { error: 'FAL_KEY is not configured' },
        { status: 500 }
      );
    }

    // Fal accepts image_url as URL or base64 data URI
    const res = await fetch(FAL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: image,
        prompt,
        num_inference_steps: 28,
        strength: 0.85,
        guidance_scale: 3.5,
        output_format: 'jpeg',
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: err || res.statusText },
        { status: res.status }
      );
    }

    const data = await res.json();
    const imageUrl = data.images?.[0]?.url ?? data.image?.url ?? null;
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image in response' },
        { status: 502 }
      );
    }

    return NextResponse.json({ imageUrl });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
