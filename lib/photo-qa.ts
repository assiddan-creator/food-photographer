export type PhotoQaResult = {
  ok: boolean;
  issues: string[];
  tipHe: string;
  focusOk: boolean;
  lightingOk: boolean;
  framingOk: boolean;
};

export const PHOTO_QA_PASS_TIP = 'התמונה בסדר';

export function splitImagePayload(image: string): { mimeType: string; base64: string } {
  if (image.startsWith('data:')) {
    const match = image.match(/^data:([^;]+);base64,([\s\S]*)$/);
    if (match?.[1] && match[2]) {
      return { mimeType: match[1], base64: match[2] };
    }
  }

  return {
    mimeType: 'image/jpeg',
    base64: image.includes(',') ? image.slice(image.indexOf(',') + 1) : image,
  };
}

function asBoolean(value: unknown): boolean {
  return value === true || value === 'true' || value === 1;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

export function normalizePhotoQa(raw: unknown): PhotoQaResult {
  const obj = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const focusOk = asBoolean(obj.focusOk);
  const lightingOk = asBoolean(obj.lightingOk);
  const framingOk = asBoolean(obj.framingOk);
  const issues = asStringArray(obj.issues);
  const ok = focusOk && lightingOk && framingOk;

  let tipHe = typeof obj.tipHe === 'string' ? obj.tipHe.trim() : '';
  if (ok) {
    tipHe = PHOTO_QA_PASS_TIP;
  } else if (!tipHe) {
    tipHe = issues[0] ?? 'קרב למנה, החזק יציב, ותן אור טבעי.';
  }

  return { ok, issues, tipHe, focusOk, lightingOk, framingOk };
}
