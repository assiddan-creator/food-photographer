import { GoogleGenerativeAI } from '@google/generative-ai';
import { normalizePhotoQa, type PhotoQaResult } from '@/lib/photo-qa';

export const DEFAULT_GEMINI_ANALYZE_MODEL = 'gemini-3-flash-preview';
export const FALLBACK_GEMINI_ANALYZE_MODEL = 'gemini-2.5-flash';

function getGenAI(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return new GoogleGenerativeAI(apiKey);
}

export function getGeminiAnalyzeModel(): string {
  return process.env.GEMINI_ANALYZE_MODEL?.trim() || DEFAULT_GEMINI_ANALYZE_MODEL;
}

function isModelUnavailableError(err: unknown): boolean {
  const msg = String((err as Error)?.message ?? err ?? '').toLowerCase();
  return (
    msg.includes('not found') ||
    msg.includes('is not found') ||
    msg.includes('not supported') ||
    msg.includes('unknown model') ||
    msg.includes('invalid model') ||
    msg.includes('404')
  );
}

function parseJsonText(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  const payload = fenced?.[1]?.trim() ?? trimmed;
  return JSON.parse(payload);
}

async function generateJsonFromImage(
  systemPrompt: string,
  imageBase64: string,
  mimeType: string,
  modelName: string,
): Promise<unknown> {
  const model = getGenAI().getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const result = await model.generateContent([
    systemPrompt,
    {
      inlineData: {
        data: imageBase64,
        mimeType,
      },
    },
  ]);

  const text = result.response.text();
  try {
    return parseJsonText(text);
  } catch (parseErr) {
    throw new Error(`Failed to parse Gemini JSON response: ${(parseErr as Error).message}`);
  }
}

async function generateJsonWithModelFallback(
  systemPrompt: string,
  imageBase64: string,
  mimeType: string,
): Promise<unknown> {
  const preferred = getGeminiAnalyzeModel();
  try {
    return await generateJsonFromImage(systemPrompt, imageBase64, mimeType, preferred);
  } catch (err) {
    if (preferred !== FALLBACK_GEMINI_ANALYZE_MODEL && isModelUnavailableError(err)) {
      return generateJsonFromImage(
        systemPrompt,
        imageBase64,
        mimeType,
        FALLBACK_GEMINI_ANALYZE_MODEL,
      );
    }
    throw err;
  }
}

export async function analyzeFoodImage(
  imageBase64: string,
  mimeType: string,
  systemPrompt: string,
): Promise<unknown> {
  try {
    return await generateJsonWithModelFallback(systemPrompt, imageBase64, mimeType);
  } catch (err) {
    throw new Error(`analyzeFoodImage failed: ${(err as Error).message}`);
  }
}

const PHOTO_QA_PROMPT = `You are a practical kitchen photo checker for restaurant staff photographing a dish with a phone.

Judge only whether the photo is good enough to enhance for a menu / Wolt listing. Kitchen photos do not need to be studio-perfect.

Check:
1. focusOk — sharp enough, not blurry/shaky
2. lightingOk — dish is visible; not extremely dark, not blown-out white
3. framingOk — the full dish / plate is in frame, not cropped, not a tiny speck far away

ok is true only when focusOk, lightingOk, and framingOk are all true.

Return JSON with EXACTLY these keys:
- ok (boolean)
- focusOk (boolean)
- lightingOk (boolean)
- framingOk (boolean)
- issues (array of short Hebrew labels, e.g. "מטושטש", "חשוך", "המנה חתוכה")
- tipHe (string, spoken Hebrew only)

If ok is true, tipHe MUST be exactly: התמונה בסדר
If ok is false, tipHe is ONE short kitchen tip (what to do now). No English, no markdown.`;

export async function analyzePhotoQuality(
  imageBase64: string,
  mimeType: string,
): Promise<PhotoQaResult> {
  try {
    const raw = await generateJsonWithModelFallback(PHOTO_QA_PROMPT, imageBase64, mimeType);
    return normalizePhotoQa(raw);
  } catch (err) {
    throw new Error(`analyzePhotoQuality failed: ${(err as Error).message}`);
  }
}
