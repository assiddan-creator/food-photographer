import { triggerDownload } from '@/lib/wolt-export';

/** Official TikTok / Stories / Reels ratio: vertical 9:16. */
export const TIKTOK_ASPECT = 9 / 16;
/** Aim for a long edge of at least 1000px when a cheap canvas upscale is enough. */
export const TIKTOK_MIN_LONG_EDGE = 1000;
export const TIKTOK_JPEG_QUALITY = 0.92;

export type CropRect = {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
};

export type Size = {
  width: number;
  height: number;
};

/**
 * Largest 9:16 rectangle centered on the source. Wider sources lose left/right;
 * taller sources lose top/bottom. No bars, text, or borders are added.
 */
export function computeCenterCrop9x16(width: number, height: number): CropRect {
  if (width <= 0 || height <= 0) {
    throw new Error('Invalid image size');
  }

  const sourceRatio = width / height;
  if (sourceRatio > TIKTOK_ASPECT) {
    const sw = height * TIKTOK_ASPECT;
    return { sx: (width - sw) / 2, sy: 0, sw, sh: height };
  }

  const sh = width / TIKTOK_ASPECT;
  return { sx: 0, sy: (height - sh) / 2, sw: width, sh };
}

/**
 * Output canvas size: exact 9:16 (height multiple of 16), never smaller than
 * the cropped source, and at least 1000px on the long edge when upscaling.
 */
export function computeTikTokOutputSize(cropWidth: number, cropHeight: number): Size {
  const longEdge = Math.max(cropWidth, cropHeight);
  let height = Math.round(longEdge < TIKTOK_MIN_LONG_EDGE ? TIKTOK_MIN_LONG_EDGE : longEdge);
  height = Math.ceil(height / 16) * 16;
  if (height < TIKTOK_MIN_LONG_EDGE) {
    height += 16;
  }
  const width = (height * 9) / 16;
  return { width, height };
}

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

/**
 * Fetch the generated image, center-crop to 9:16, optionally upscale so the
 * long edge is ≥1000px, and return a clean JPEG (no text / borders / watermark).
 */
export async function exportTikTokJpeg(sourceUrl: string): Promise<Blob> {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error('Failed to load image');
  }

  const blob = await response.blob();
  const image = await loadImageFromBlob(blob);
  const crop = computeCenterCrop9x16(image.naturalWidth || image.width, image.naturalHeight || image.height);
  const out = computeTikTokOutputSize(crop.sw, crop.sh);

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
    canvas.toBlob(resolve, 'image/jpeg', TIKTOK_JPEG_QUALITY);
  });

  if (!jpeg) {
    throw new Error('JPEG export failed');
  }

  return jpeg;
}

export { triggerDownload };
