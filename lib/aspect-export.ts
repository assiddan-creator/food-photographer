import { computeAspectOutputSize, computeCenterCrop } from '@/lib/aspect-crop';

export const EXPORT_JPEG_QUALITY = 0.92;

function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to decode image'));
    };
    img.src = url;
  });
}

export async function loadImageFromUrl(sourceUrl: string): Promise<HTMLImageElement> {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error('Failed to load image');
  }
  const blob = await response.blob();
  return loadImageFromBlob(blob);
}

/**
 * Center-crop the decoded image to `ratioW:ratioH` and encode a clean JPEG.
 * No text, bars, borders, or watermarks.
 */
export async function exportCoverJpegFromImage(
  image: HTMLImageElement,
  ratioW: number,
  ratioH: number,
): Promise<Blob> {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const crop = computeCenterCrop(width, height, ratioW / ratioH);
  const out = computeAspectOutputSize(crop.sw, crop.sh, ratioW, ratioH);

  const canvas = document.createElement('canvas');
  canvas.width = out.width;
  canvas.height = out.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas not available');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, out.width, out.height);

  const jpeg = await new Promise<Blob | null>(resolve => {
    canvas.toBlob(resolve, 'image/jpeg', EXPORT_JPEG_QUALITY);
  });

  if (!jpeg) {
    throw new Error('JPEG export failed');
  }

  return jpeg;
}

export async function exportCoverJpeg(
  sourceUrl: string,
  ratioW: number,
  ratioH: number,
): Promise<Blob> {
  const image = await loadImageFromUrl(sourceUrl);
  return exportCoverJpegFromImage(image, ratioW, ratioH);
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function sleep(ms: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });
}
