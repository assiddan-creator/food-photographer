import JSZip from 'jszip';
import { exportTikTokJpeg } from '@/lib/tiktok-export';
import { exportWoltJpeg, triggerDownload } from '@/lib/wolt-export';

export type ZipSource = {
  fileName: string;
  outputUrl: string;
};

export type BatchZipKind = 'wolt' | 'tiktok' | 'original';

function fileStem(fileName: string, index: number) {
  const raw = fileName.replace(/\.[^.]+$/, '').trim() || `dish-${index + 1}`;
  const safe = raw.replace(/[^\w\u0590-\u05FF-]+/g, '_').replace(/_+/g, '_').slice(0, 40);
  return `${String(index + 1).padStart(2, '0')}-${safe || `dish-${index + 1}`}`;
}

export async function downloadBatchZip(sources: ZipSource[], kind: BatchZipKind) {
  if (sources.length === 0) {
    throw new Error('אין תמונות מוכנות להורדה');
  }

  const zip = new JSZip();

  for (let index = 0; index < sources.length; index++) {
    const source = sources[index];
    const blob =
      kind === 'wolt'
        ? await exportWoltJpeg(source.outputUrl)
        : kind === 'tiktok'
          ? await exportTikTokJpeg(source.outputUrl)
          : await fetch(source.outputUrl).then(response => {
              if (!response.ok) throw new Error('Failed to load image');
              return response.blob();
            });
    const suffix =
      kind === 'wolt' ? '-wolt-16x9.jpg' : kind === 'tiktok' ? '-tiktok-9x16.jpg' : '.jpg';
    zip.file(`${fileStem(source.fileName, index)}${suffix}`, blob);
  }

  const archive = await zip.generateAsync({ type: 'blob' });
  const stamp = Date.now();
  const zipName =
    kind === 'wolt'
      ? `menu-wolt-16x9-${stamp}.zip`
      : kind === 'tiktok'
        ? `menu-tiktok-9x16-${stamp}.zip`
        : `menu-${stamp}.zip`;
  triggerDownload(archive, zipName);
}
