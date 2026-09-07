/** Official Wolt listing ratio: horizontal 16:9. */
export const WOLT_ASPECT = 16 / 9;
/** Aim for a long edge of at least 1000px when a cheap canvas upscale is enough. */
export const WOLT_MIN_LONG_EDGE = 1000;
export const WOLT_JPEG_QUALITY = 0.92;

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
 * Largest 16:9 rectangle centered on the source. Wider sources lose left/right;
 * taller sources lose top/bottom. No bars, text, or borders are added.
 */
export function computeCenterCrop16x9(width: number, height: number): CropRect {
  if (width <= 0 || height <= 0) {
    throw new Error('Invalid image size');
  }

  const sourceRatio = width / height;
  if (sourceRatio > WOLT_ASPECT) {
    const sw = height * WOLT_ASPECT;
    return { sx: (width - sw) / 2, sy: 0, sw, sh: height };
  }

  const sh = width / WOLT_ASPECT;
  return { sx: 0, sy: (height - sh) / 2, sw: width, sh };
}

/**
 * Output canvas size: exact 16:9 (width multiple of 16), never smaller than
 * the cropped source, and at least 1000px on the long edge when upscaling.
 */
export function computeWoltOutputSize(cropWidth: number, cropHeight: number): Size {
  const longEdge = Math.max(cropWidth, cropHeight);
  let width = Math.round(longEdge < WOLT_MIN_LONG_EDGE ? WOLT_MIN_LONG_EDGE : longEdge);
  width = Math.ceil(width / 16) * 16;
  if (width < WOLT_MIN_LONG_EDGE) {
    width += 16;
  }
  const height = (width * 9) / 16;
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
 * Fetch the generated image, center-crop to 16:9, optionally upscale so the
 * long edge is ≥1000px, and return a clean JPEG (no text / borders / watermark).
 */
export async function exportWoltJpeg(sourceUrl: string): Promise<Blob> {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error('Failed to load image');
  }

  const blob = await response.blob();
  const image = await loadImageFromBlob(blob);
  const crop = computeCenterCrop16x9(image.naturalWidth || image.width, image.naturalHeight || image.height);
  const out = computeWoltOutputSize(crop.sw, crop.sh);

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
    canvas.toBlob(resolve, 'image/jpeg', WOLT_JPEG_QUALITY);
  });

  if (!jpeg) {
    throw new Error('JPEG export failed');
  }

  return jpeg;
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
