import {
  exportCoverJpegFromImage,
  loadImageFromUrl,
  sleep,
  triggerDownload,
} from '@/lib/aspect-export';

export type PlatformTargetId = 'wolt' | 'tenbis' | 'story' | 'square';

export type PlatformAspectKey = '16:9' | '9:16' | '1:1';

export type PlatformTarget = {
  id: PlatformTargetId;
  filename: string;
  ratioW: number;
  ratioH: number;
  aspectKey: PlatformAspectKey;
  labelHe: string;
  ratioLabel: string;
  noteHe: string;
};

export const PLATFORM_TARGETS: readonly PlatformTarget[] = [
  {
    id: 'wolt',
    filename: 'wolt-16x9.jpg',
    ratioW: 16,
    ratioH: 9,
    aspectKey: '16:9',
    labelHe: 'וולט',
    ratioLabel: '16:9',
    noteHe: 'רקע מחמיא · מנה זהה',
  },
  {
    id: 'tenbis',
    filename: 'tenbis-16x9.jpg',
    ratioW: 16,
    ratioH: 9,
    aspectKey: '16:9',
    labelHe: 'תן ביס',
    ratioLabel: '16:9',
    noteHe: 'משלוחים · גם סיבוס · 16:9',
  },
  {
    id: 'story',
    filename: 'story-9x16.jpg',
    ratioW: 9,
    ratioH: 16,
    aspectKey: '9:16',
    labelHe: 'סטורי / ריל',
    ratioLabel: '9:16',
    noteHe: 'טיקטוק · אינסטגרם · סטורי',
  },
  {
    id: 'square',
    filename: 'square-1x1.jpg',
    ratioW: 1,
    ratioH: 1,
    aspectKey: '1:1',
    labelHe: 'ריבוע',
    ratioLabel: '1:1',
    noteHe: 'תפריט · פיד · וואטסאפ',
  },
] as const;

export const DELIVERY_TARGET_IDS: readonly PlatformTargetId[] = ['wolt', 'tenbis'];

const TARGET_BY_ID = new Map(PLATFORM_TARGETS.map(target => [target.id, target]));

export function getPlatformTarget(id: PlatformTargetId): PlatformTarget {
  const target = TARGET_BY_ID.get(id);
  if (!target) {
    throw new Error(`Unknown export target: ${id}`);
  }
  return target;
}

export function defaultPlatformSelection(isStory: boolean): Set<PlatformTargetId> {
  return new Set(isStory ? ['story'] : ['wolt']);
}

/**
 * Crop the generated image once per unique aspect. Wolt and Ten Bis share 16:9.
 */
export async function exportPlatformFiles(
  sourceUrl: string,
  ids: readonly PlatformTargetId[],
): Promise<File[]> {
  if (ids.length === 0) {
    throw new Error('No export targets selected');
  }

  const image = await loadImageFromUrl(sourceUrl);
  const jpegByAspect = new Map<PlatformAspectKey, Blob>();
  const files: File[] = [];

  for (const id of ids) {
    const target = getPlatformTarget(id);
    let jpeg = jpegByAspect.get(target.aspectKey);
    if (!jpeg) {
      jpeg = await exportCoverJpegFromImage(image, target.ratioW, target.ratioH);
      jpegByAspect.set(target.aspectKey, jpeg);
    }
    files.push(new File([jpeg], target.filename, { type: 'image/jpeg' }));
  }

  return files;
}

export async function downloadFiles(files: readonly File[]) {
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    triggerDownload(file, file.name);
    if (index < files.length - 1) {
      await sleep(400);
    }
  }
}

export async function shareFiles(files: readonly File[]): Promise<'shared' | 'aborted' | 'unavailable'> {
  try {
    if (typeof navigator === 'undefined' || !navigator.share) {
      return 'unavailable';
    }

    const payload = {
      files: [...files],
      title: 'תמונת מנה',
      text: 'המנה מוכנה',
    };

    if (navigator.canShare?.(payload)) {
      await navigator.share(payload);
      return 'shared';
    }

    if (files.length === 1 && navigator.canShare?.({ files: [files[0]] })) {
      await navigator.share({
        files: [files[0]],
        title: payload.title,
        text: payload.text,
      });
      return 'shared';
    }

    return 'unavailable';
  } catch (err) {
    if ((err as Error).name === 'AbortError') return 'aborted';
    return 'unavailable';
  }
}
