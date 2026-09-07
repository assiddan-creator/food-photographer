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

export const MIN_EXPORT_LONG_EDGE = 1000;

/**
 * Largest rectangle of `aspect` (width/height) centered on the source.
 * Wider sources lose left/right; taller sources lose top/bottom.
 */
export function computeCenterCrop(width: number, height: number, aspect: number): CropRect {
  if (width <= 0 || height <= 0) {
    throw new Error('Invalid image size');
  }

  const sourceRatio = width / height;
  if (sourceRatio > aspect) {
    const sw = height * aspect;
    return { sx: (width - sw) / 2, sy: 0, sw, sh: height };
  }

  const sh = width / aspect;
  return { sx: 0, sy: (height - sh) / 2, sw: width, sh };
}

/**
 * Output canvas size for a ratio `ratioW:ratioH`. Long edge is at least 1000px
 * and snapped so the short edge stays an integer (16:9 / 9:16 snap to 16).
 */
export function computeAspectOutputSize(
  cropWidth: number,
  cropHeight: number,
  ratioW: number,
  ratioH: number,
): Size {
  if (cropWidth <= 0 || cropHeight <= 0) {
    throw new Error('Invalid crop size');
  }
  if (ratioW <= 0 || ratioH <= 0) {
    throw new Error('Invalid aspect ratio');
  }

  const longEdge = Math.max(cropWidth, cropHeight);

  if (ratioW === ratioH) {
    let size = Math.round(longEdge < MIN_EXPORT_LONG_EDGE ? MIN_EXPORT_LONG_EDGE : longEdge);
    size = Math.ceil(size / 16) * 16;
    if (size < MIN_EXPORT_LONG_EDGE) {
      size += 16;
    }
    return { width: size, height: size };
  }

  if (ratioW > ratioH) {
    let width = Math.round(longEdge < MIN_EXPORT_LONG_EDGE ? MIN_EXPORT_LONG_EDGE : longEdge);
    width = Math.ceil(width / ratioW) * ratioW;
    if (width < MIN_EXPORT_LONG_EDGE) {
      width += ratioW;
    }
    return { width, height: (width * ratioH) / ratioW };
  }

  let height = Math.round(longEdge < MIN_EXPORT_LONG_EDGE ? MIN_EXPORT_LONG_EDGE : longEdge);
  height = Math.ceil(height / ratioH) * ratioH;
  if (height < MIN_EXPORT_LONG_EDGE) {
    height += ratioH;
  }
  return { width: (height * ratioW) / ratioH, height };
}
