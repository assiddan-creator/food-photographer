import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 8,
    maxWidthOrHeight: 2048,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.85,
  });
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}
