import { useState, useCallback, useRef, useEffect } from 'react';
import {
  configureFalClient,
  generateWithFal,
  type FalModelId,
  type OrientationRatio,
} from '@/lib/fal-generate';

export type PipelineStage = 'idle' | 'generating' | 'done' | 'error';
export type { FalModelId, OrientationRatio };

interface State {
  stage: PipelineStage;
  progress: number;
  statusMessage: string;
  outputUrl: string | null;
  error: string | null;
  latencyMs: number | null;
}

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
    configureFalClient();
  }, []);

  const run = useCallback(async (
    base64Image: string,
    prompt: string,
    aspectRatio: OrientationRatio,
    model: FalModelId,
  ) => {
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
      const { outputUrl, latencyMs } = await generateWithFal(
        base64Image,
        prompt,
        aspectRatio,
        model,
        {
          isAborted: () => abortRef.current,
          onStatus: statusMessage => {
            if (!abortRef.current) {
              setState(prev => ({ ...prev, statusMessage }));
            }
          },
        },
      );

      if (abortRef.current) return;

      setState({
        stage: 'done',
        progress: 100,
        statusMessage: 'Done!',
        outputUrl,
        error: null,
        latencyMs,
      });
    } catch (err) {
      if (abortRef.current || (err instanceof DOMException && err.name === 'AbortError')) {
        return;
      }
      const msg = (err as Error).message;
      setState(prev => ({
        ...prev,
        stage: 'error',
        error: msg,
        statusMessage: msg,
        latencyMs: performance.now() - start,
      }));
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
