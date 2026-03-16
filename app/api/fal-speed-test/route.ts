import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const FAL_ENDPOINT = 'https://fal.run/fal-ai/nano-banana-2/edit';

export async function POST(request: NextRequest) {
  try {
    const { image_url, prompt } = await request.json();
    if (!image_url || !prompt) {
      return NextResponse.json(
        { error: 'image_url and prompt are required' },
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

    const res = await fetch(FAL_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Key ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_urls: [image_url],
        num_images: 1,
        output_format: 'jpeg',
        resolution: '1K',
      }),
    });

    if (!res.ok) {
      let errorMessage: string;
      const contentType = res.headers.get('content-type') ?? '';
      try {
        if (contentType.includes('application/json')) {
          const errBody = await res.json();
          errorMessage =
            typeof errBody?.detail === 'string'
              ? errBody.detail
              : errBody?.message ??
                (typeof errBody?.error === 'string' ? errBody.error : null) ??
                JSON.stringify(errBody);
          console.error('[fal-speed-test] Fal API error response:', errBody);
        } else {
          errorMessage = await res.text();
          console.error('[fal-speed-test] Fal API error (non-JSON):', errorMessage);
        }
      } catch (e) {
        errorMessage = res.statusText || 'Unknown error';
        console.error('[fal-speed-test] Failed to parse error response:', e);
      }
      if (!errorMessage?.trim()) errorMessage = res.statusText || 'Request failed';
      return NextResponse.json(
        { error: errorMessage },
        { status: res.status }
      );
    }

    const data = await res.json();
    const imageUrl = data.images?.[0]?.url ?? null;
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
