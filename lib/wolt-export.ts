import { computeAspectOutputSize, computeCenterCrop, type CropRect, type Size } from '@/lib/aspect-crop';
import { exportCoverJpeg, triggerDownload } from '@/lib/aspect-export';

/** Official Wolt listing ratio: horizontal 16:9. */
export const WOLT_ASPECT = 16 / 9;
/** Aim for a long edge of at least 1000px when a cheap canvas upscale is enough. */
export const WOLT_MIN_LONG_EDGE = 1000;
export const WOLT_JPEG_QUALITY = 0.92;

export type { CropRect, Size };

/**
 * Largest 16:9 rectangle centered on the source. Wider sources lose left/right;
 * taller sources lose top/bottom. No bars, text, or borders are added.
 */
export function computeCenterCrop16x9(width: number, height: number): CropRect {
  return computeCenterCrop(width, height, WOLT_ASPECT);
}

/**
 * Output canvas size: exact 16:9 (width multiple of 16), never smaller than
 * the cropped source, and at least 1000px on the long edge when upscaling.
 */
export function computeWoltOutputSize(cropWidth: number, cropHeight: number): Size {
  return computeAspectOutputSize(cropWidth, cropHeight, 16, 9);
}

/**
 * Fetch the generated image, center-crop to 16:9, optionally upscale so the
 * long edge is ≥1000px, and return a clean JPEG (no text / borders / watermark).
 */
export async function exportWoltJpeg(sourceUrl: string): Promise<Blob> {
  return exportCoverJpeg(sourceUrl, 16, 9);
}

export { triggerDownload };
