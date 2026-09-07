import { computeAspectOutputSize, computeCenterCrop, type CropRect, type Size } from '@/lib/aspect-crop';
import { exportCoverJpeg, triggerDownload } from '@/lib/aspect-export';

/** Official TikTok / Stories / Reels ratio: vertical 9:16. */
export const TIKTOK_ASPECT = 9 / 16;
/** Aim for a long edge of at least 1000px when a cheap canvas upscale is enough. */
export const TIKTOK_MIN_LONG_EDGE = 1000;
export const TIKTOK_JPEG_QUALITY = 0.92;

export type { CropRect, Size };

/**
 * Largest 9:16 rectangle centered on the source. Wider sources lose left/right;
 * taller sources lose top/bottom. No bars, text, or borders are added.
 */
export function computeCenterCrop9x16(width: number, height: number): CropRect {
  return computeCenterCrop(width, height, TIKTOK_ASPECT);
}

/**
 * Output canvas size: exact 9:16 (height multiple of 16), never smaller than
 * the cropped source, and at least 1000px on the long edge when upscaling.
 */
export function computeTikTokOutputSize(cropWidth: number, cropHeight: number): Size {
  return computeAspectOutputSize(cropWidth, cropHeight, 9, 16);
}

/**
 * Fetch the generated image, center-crop to 9:16, optionally upscale so the
 * long edge is ≥1000px, and return a clean JPEG (no text / borders / watermark).
 */
export async function exportTikTokJpeg(sourceUrl: string): Promise<Blob> {
  return exportCoverJpeg(sourceUrl, 9, 16);
}

export { triggerDownload };
