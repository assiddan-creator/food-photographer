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

export async function shareImagesWithText(options: {
  files: File[];
  text: string;
  title: string;
}): Promise<'shared' | 'aborted' | 'unavailable'> {
  try {
    if (typeof navigator === 'undefined' || !navigator.share) {
      return 'unavailable';
    }

    const files = options.files.filter(Boolean);
    if (files.length > 0 && navigator.canShare?.({ files })) {
      await navigator.share({
        files,
        title: options.title,
        text: options.text,
      });
      return 'shared';
    }

    if (files[0] && navigator.canShare?.({ files: [files[0]] })) {
      await navigator.share({
        files: [files[0]],
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

export async function shareImageWithText(options: {
  file: File;
  text: string;
  title: string;
}): Promise<'shared' | 'aborted' | 'unavailable'> {
  return shareImagesWithText({
    files: [options.file],
    text: options.text,
    title: options.title,
  });
}
