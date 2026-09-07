import { useCallback, useEffect, useRef, useState } from 'react';
import { compressImage, fileToBase64 } from '@/lib/compress';
import { generateWithFal, type FalModelId, type OrientationRatio } from '@/lib/fal-generate';
import { BATCH_MAX_IMAGES } from '@/lib/presets';

export type BatchItemStatus = 'pending' | 'working' | 'done' | 'error' | 'skipped';

export type BatchItem = {
  id: string;
  fileName: string;
  previewUrl: string;
  base64: string;
  status: BatchItemStatus;
  outputUrl: string | null;
  error: string | null;
};

function newItemId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `dish-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isAbortError(err: unknown) {
  return err instanceof DOMException && err.name === 'AbortError';
}

export function useBatchPipeline() {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const itemsRef = useRef<BatchItem[]>([]);
  const abortRef = useRef(false);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      abortRef.current = true;
      for (const item of itemsRef.current) {
        URL.revokeObjectURL(item.previewUrl);
      }
    };
  }, []);

  const patchItem = useCallback((id: string, patch: Partial<BatchItem>) => {
    setItems(prev => prev.map(item => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const addFiles = useCallback(async (files: File[]) => {
    const images = files.filter(file => file.type.startsWith('image/'));
    if (images.length === 0) return;

    const room = BATCH_MAX_IMAGES - itemsRef.current.length;
    if (room <= 0) {
      setNotice(`אפשר עד ${BATCH_MAX_IMAGES} תמונות בכל הרצה.`);
      return;
    }

    const accepted = images.slice(0, room);
    if (images.length > room) {
      setNotice(`אפשר עד ${BATCH_MAX_IMAGES} תמונות. לקחנו את ה-${room} הראשונות.`);
    } else {
      setNotice(null);
    }

    const next: BatchItem[] = [];
    for (const file of accepted) {
      const compressed = await compressImage(file);
      const base64 = await fileToBase64(compressed);
      next.push({
        id: newItemId(),
        fileName: file.name,
        previewUrl: URL.createObjectURL(compressed),
        base64,
        status: 'pending',
        outputUrl: null,
        error: null,
      });
    }

    setItems(prev => [...prev, ...next]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => {
      const target = prev.find(item => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter(item => item.id !== id);
    });
  }, []);

  const skipItem = useCallback((id: string) => {
    const current = itemsRef.current.find(item => item.id === id);
    if (!current || current.status === 'working' || current.status === 'done') return;
    patchItem(id, { status: 'skipped', error: null });
  }, [patchItem]);

  const clearAll = useCallback(() => {
    abortRef.current = true;
    for (const item of itemsRef.current) {
      URL.revokeObjectURL(item.previewUrl);
    }
    setItems([]);
    setIsRunning(false);
    setNotice(null);
  }, []);

  const runOne = useCallback(async (
    item: BatchItem,
    prompt: string,
    aspectRatio: OrientationRatio,
    model: FalModelId,
  ) => {
    patchItem(item.id, { status: 'working', error: null });
    try {
      const { outputUrl } = await generateWithFal(item.base64, prompt, aspectRatio, model, {
        isAborted: () => abortRef.current,
      });
      if (abortRef.current) return;
      patchItem(item.id, { status: 'done', outputUrl, error: null });
    } catch (err) {
      if (abortRef.current || isAbortError(err)) return;
      patchItem(item.id, {
        status: 'error',
        error: (err as Error).message || 'שגיאה ביצירה',
      });
    }
  }, [patchItem]);

  const start = useCallback(async (
    prompt: string,
    aspectRatio: OrientationRatio,
    model: FalModelId,
    onlyIds?: string[],
  ) => {
    abortRef.current = false;
    setIsRunning(true);

    const queue = itemsRef.current.filter(item => {
      if (onlyIds && !onlyIds.includes(item.id)) return false;
      return item.status === 'pending' || item.status === 'error';
    });

    for (const item of queue) {
      if (abortRef.current) break;
      const latest = itemsRef.current.find(entry => entry.id === item.id);
      if (!latest || latest.status === 'skipped' || latest.status === 'done') continue;
      await runOne(latest, prompt, aspectRatio, model);
    }

    setIsRunning(false);
  }, [runOne]);

  const retryItem = useCallback(async (
    id: string,
    prompt: string,
    aspectRatio: OrientationRatio,
    model: FalModelId,
  ) => {
    const item = itemsRef.current.find(entry => entry.id === id);
    if (!item || item.status === 'working' || item.status === 'done') return;
    patchItem(id, { status: 'pending', error: null });
    if (isRunning) return;
    abortRef.current = false;
    setIsRunning(true);
    const latest = itemsRef.current.find(entry => entry.id === id) ?? { ...item, status: 'pending' as const };
    await runOne(latest, prompt, aspectRatio, model);
    setIsRunning(false);
  }, [isRunning, patchItem, runOne]);

  const processedCount = items.filter(item =>
    item.status === 'done' || item.status === 'error' || item.status === 'skipped',
  ).length;
  const doneCount = items.filter(item => item.status === 'done').length;
  const errorCount = items.filter(item => item.status === 'error').length;
  const workingIndex = items.findIndex(item => item.status === 'working');

  return {
    items,
    isRunning,
    notice,
    addFiles,
    removeItem,
    skipItem,
    retryItem,
    start,
    clearAll,
    processedCount,
    doneCount,
    errorCount,
    workingIndex,
    maxImages: BATCH_MAX_IMAGES,
  };
}
