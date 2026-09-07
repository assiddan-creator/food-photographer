import { fal } from '@fal-ai/client';
import { dataUrlToBlob } from '@/lib/fal-client';

export type OrientationRatio = '16:9' | '9:16' | '1:1';

export type FalModelId =
  | 'fal-ai/nano-banana/edit'
  | 'fal-ai/nano-banana-2/edit'
  | 'fal-ai/nano-banana-pro/edit'
  | 'fal-ai/bytedance/seedream/v5/lite/edit'
  | 'fal-ai/flux-2-pro/edit';

export function configureFalClient() {
  if (typeof window === 'undefined') return;
  fal.config({ proxyUrl: '/api/fal/proxy' });
}

function buildModelInput(
  prompt: string,
  imageUrl: string,
  aspectRatio: OrientationRatio,
  model: FalModelId,
): Record<string, unknown> {
  const input: Record<string, unknown> = {
    prompt,
    image_urls: [imageUrl],
  };

  if (model === 'fal-ai/nano-banana/edit') {
    return { ...input, aspect_ratio: aspectRatio, output_format: 'jpeg' };
  }

  if (model === 'fal-ai/nano-banana-2/edit') {
    return { ...input, aspect_ratio: aspectRatio, resolution: '0.5K', output_format: 'jpeg' };
  }

  if (model === 'fal-ai/nano-banana-pro/edit') {
    return { ...input, aspect_ratio: aspectRatio, resolution: '1K', output_format: 'jpeg' };
  }

  if (model === 'fal-ai/bytedance/seedream/v5/lite/edit') {
    const image_size =
      aspectRatio === '16:9'
        ? { width: 2560, height: 1440 }
        : aspectRatio === '9:16'
          ? { width: 1440, height: 2560 }
          : { width: 2048, height: 2048 };
    return { ...input, image_size };
  }

  const image_size =
    aspectRatio === '16:9'
      ? 'landscape_4_3'
      : aspectRatio === '9:16'
        ? 'portrait_4_3'
        : 'square_1_1';
  return { ...input, image_size, output_format: 'jpeg' };
}

export type GenerateWithFalOptions = {
  isAborted?: () => boolean;
  onStatus?: (message: string) => void;
};

export async function generateWithFal(
  base64Image: string,
  prompt: string,
  aspectRatio: OrientationRatio,
  model: FalModelId,
  options: GenerateWithFalOptions = {},
): Promise<{ outputUrl: string; latencyMs: number }> {
  configureFalClient();

  const start = performance.now();
  const throwIfAborted = () => {
    if (options.isAborted?.()) {
      throw new DOMException('Aborted', 'AbortError');
    }
  };

  options.onStatus?.('Uploading image...');
  const blob = dataUrlToBlob(base64Image);
  const imageUrl = await fal.storage.upload(blob);
  throwIfAborted();

  options.onStatus?.('Generating...');
  const input = buildModelInput(prompt, imageUrl, aspectRatio, model);

  const result = await fal.subscribe(model, {
    input,
    // sync_mode is supported by the runtime API but not declared in the current TypeScript types.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  throwIfAborted();

  const outputUrl = result.data?.images?.[0]?.url ?? null;
  if (!outputUrl) {
    throw new Error('No image in response');
  }

  return { outputUrl, latencyMs: performance.now() - start };
}
