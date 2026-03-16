import fal from '@fal-ai/client';

fal.configure({
  credentials: process.env.FAL_KEY!,
});

export async function generateWithFal(imageUrl: string, prompt: string): Promise<string> {
  const result = await fal.subscribe('fal-ai/nano-banana-2', {
    input: {
      prompt,
      image_input: [imageUrl],
      aspect_ratio: '1:1',
      google_search: true,
      output_format: 'png',
    },
    logs: false,
    onResult: () => {},
  });

  const output = (result as any).images ?? (result as any).output;
  const firstImage = Array.isArray(output) ? output[0] : output;
  return typeof firstImage === 'string' ? firstImage : firstImage.url;
}

export async function restoreWithFal(imageUrl: string): Promise<string> {
  const result = await fal.subscribe('fal-ai/face-restorer', {
    input: {
      image_url: imageUrl,
    },
    logs: false,
    onResult: () => {},
  });

  const output = (result as any).images ?? (result as any).output;
  const firstImage = Array.isArray(output) ? output[0] : output;
  return typeof firstImage === 'string' ? firstImage : firstImage.url;
}

