export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export async function fetchImageFile(url: string, filename: string): Promise<File> {
  const blob = await fetch(url).then(r => r.blob());
  return new File([blob], filename, { type: blob.type || 'image/jpeg' });
}

export async function shareImageWithText(options: {
  file: File;
  text: string;
  title: string;
}): Promise<'shared' | 'aborted' | 'unavailable'> {
  try {
    if (typeof navigator === 'undefined' || !navigator.share) {
      return 'unavailable';
    }
    if (navigator.canShare?.({ files: [options.file] })) {
      await navigator.share({
        files: [options.file],
        title: options.title,
        text: options.text,
      });
      return 'shared';
    }
    await navigator.share({
      title: options.title,
      text: options.text,
    });
    return 'shared';
  } catch (err) {
    if ((err as Error).name === 'AbortError') return 'aborted';
    return 'unavailable';
  }
}
