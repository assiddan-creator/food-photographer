import JSZip from 'jszip';
import { exportWoltJpeg, triggerDownload } from '@/lib/wolt-export';

export type ZipSource = {
  fileName: string;
  outputUrl: string;
};

function fileStem(fileName: string, index: number) {
  const raw = fileName.replace(/\.[^.]+$/, '').trim() || `dish-${index + 1}`;
  const safe = raw.replace(/[^\w\u0590-\u05FF-]+/g, '_').replace(/_+/g, '_').slice(0, 40);
  return `${String(index + 1).padStart(2, '0')}-${safe || `dish-${index + 1}`}`;
}

export async function downloadBatchZip(sources: ZipSource[], woltMode: boolean) {
  if (sources.length === 0) {
    throw new Error('אין תמונות מוכנות להורדה');
  }

  const zip = new JSZip();

  for (let index = 0; index < sources.length; index++) {
    const source = sources[index];
    const blob = woltMode
      ? await exportWoltJpeg(source.outputUrl)
      : await fetch(source.outputUrl).then(response => {
          if (!response.ok) throw new Error('Failed to load image');
          return response.blob();
        });
    const name = woltMode
      ? `${fileStem(source.fileName, index)}-wolt-16x9.jpg`
      : `${fileStem(source.fileName, index)}.jpg`;
    zip.file(name, blob);
  }

  const archive = await zip.generateAsync({ type: 'blob' });
  const stamp = Date.now();
  triggerDownload(archive, woltMode ? `menu-wolt-16x9-${stamp}.zip` : `menu-${stamp}.zip`);
}
