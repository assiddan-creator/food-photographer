import { useState, useCallback, useRef, useEffect } from 'react';
import { fal } from '@fal-ai/client';
import { dataUrlToBlob } from '@/lib/fal-client';

export type PipelineStage = 'idle' | 'generating' | 'done' | 'error';

interface State {
  stage: PipelineStage;
  progress: number;
  statusMessage: string;
  outputUrl: string | null;
  error: string | null;
  latencyMs: number | null;
}

function configureFalOnce() {
  if (typeof window === 'undefined') return;
  fal.config({ proxyUrl: '/api/fal/proxy' });
}

type OrientationRatio = '16:9' | '9:16' | '1:1';
type FalModelId =
  | 'fal-ai/nano-banana/edit'
  | 'fal-ai/nano-banana-2/edit'
  | 'fal-ai/nano-banana-pro/edit'
  | 'fal-ai/bytedance/seedream/v5/lite/edit'
  | 'fal-ai/flux-2-pro/edit';

export function usePipeline() {
  const abortRef = useRef(false);
  const [state, setState] = useState<State>({
    stage: 'idle',
    progress: 0,
    statusMessage: '',
    outputUrl: null,
    error: null,
    latencyMs: null,
  });

  useEffect(() => {
    configureFalOnce();
  }, []);

  const set = (patch: Partial<State>) => setState(prev => ({ ...prev, ...patch }));

  const run = useCallback(async (base64Image: string, prompt: string, aspectRatio: OrientationRatio, model: FalModelId) => {
    abortRef.current = false;
    setState({
      stage: 'generating',
      progress: 10,
      statusMessage: 'Uploading image...',
      outputUrl: null,
      error: null,
      latencyMs: null,
    });

    const start = performance.now();

    try {
      configureFalOnce();

      const blob = dataUrlToBlob(base64Image);
      const imageUrl = await fal.storage.upload(blob);
      if (abortRef.current) return;

      set({ statusMessage: 'Generating...' });

      // Base payload shared by all models
      let input: Record<string, unknown> = {
        prompt,
        image_urls: [imageUrl],
      };

      if (model === 'fal-ai/nano-banana/edit') {
        // Original Nano Banana: aspect_ratio + jpeg, no resolution field
        input = {
          ...input,
          aspect_ratio: aspectRatio,
          output_format: 'jpeg',
        };
      } else if (model === 'fal-ai/nano-banana-2/edit') {
        // Fastest Nano Banana 2: smallest supported resolution with aspect_ratio + jpeg
        input = {
          ...input,
          aspect_ratio: aspectRatio,
          resolution: '0.5K',
          output_format: 'jpeg',
        };
      } else if (model === 'fal-ai/nano-banana-pro/edit') {
        // Pro Nano Banana: lowest supported resolution 1K + jpeg
        input = {
          ...input,
          aspect_ratio: aspectRatio,
          resolution: '1K',
          output_format: 'jpeg',
        };
      } else if (model === 'fal-ai/bytedance/seedream/v5/lite/edit') {
        // Seedream 5.0 Lite: strict image_size object, no aspect_ratio / resolution / output_format
        const image_size =
          aspectRatio === '16:9'
            ? { width: 2560, height: 1440 }
            : aspectRatio === '9:16'
              ? { width: 1440, height: 2560 }
              : { width: 2048, height: 2048 };

        input = {
          ...input,
          image_size,
        };
      } else if (model === 'fal-ai/flux-2-pro/edit') {
        // Flux 2 Pro: image_size string + jpeg, no aspect_ratio / resolution
        const image_size =
          aspectRatio === '16:9'
            ? 'landscape_4_3'
            : aspectRatio === '9:16'
              ? 'portrait_4_3'
              : 'square_1_1';

        input = {
          ...input,
          image_size,
          output_format: 'jpeg',
        };
      }

      const result = await fal.subscribe(model, {
        input,
        sync_mode: true,
      });

      const end = performance.now();
      const latencyMs = end - start;

      if (abortRef.current) return;

      const outputUrl = result.data?.images?.[0]?.url ?? null;
      if (!outputUrl) {
        setState(prev => ({
          ...prev,
          stage: 'error',
          error: 'No image in response',
          statusMessage: 'No image in response',
          latencyMs,
        }));
        return;
      }

      setState({
        stage: 'done',
        progress: 100,
        statusMessage: 'Done!',
        outputUrl,
        error: null,
        latencyMs,
      });
    } catch (err) {
      if (!abortRef.current) {
        const msg = (err as Error).message;
        const latencyMs = performance.now() - start;
        setState(prev => ({
          ...prev,
          stage: 'error',
          error: msg,
          statusMessage: msg,
          latencyMs,
        }));
      }
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current = true;
    setState({
      stage: 'idle',
      progress: 0,
      statusMessage: '',
      outputUrl: null,
      error: null,
      latencyMs: null,
    });
  }, []);

  return { ...state, run, reset };
}
