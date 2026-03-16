import Replicate from 'replicate';

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export type PredictionStatus = 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';

export interface PredictionResult {
  id: string;
  status: PredictionStatus;
  output: string | string[] | null;
  error: string | null;
}

export async function startGeneration(imageUrl: string, prompt: string): Promise<string> {
  // שולפים את הגרסה בזמן אמת - 0% סיכוי ל-422 של גרסה חסרה
  const model = await replicate.models.get("google", "nano-banana-2");
  
  const prediction = await replicate.predictions.create({
    version: model.latest_version!.id,
    input: { 
      prompt: prompt,
      image_input: [imageUrl], 
      aspect_ratio: "1:1",
      google_search: true,
      output_format: "png"
    },
  });
  return prediction.id;
}

export async function startRestoration(inputUrl: any): Promise<string> {
  // משיכת הגרסה המדויקת של CodeFormer בזמן אמת
  const model = await replicate.models.get("sczhou", "codeformer");

  // הגנת ברזל: מוודאים שתמיד נשלח לינק נקי ולא מערך כדי למנוע קריסה
  const finalImageUrl = Array.isArray(inputUrl) ? inputUrl[0] : inputUrl;

  const prediction = await replicate.predictions.create({
    version: model.latest_version!.id,
    input: {
      image: finalImageUrl,
      upscale: 1, 
      face_upsample: true,
      background_enhance: true,
      codeformer_fidelity: 0.7,
    },
  });
  return prediction.id;
}

export async function getPrediction(id: string): Promise<PredictionResult> {
  return replicate.predictions.get(id) as Promise<PredictionResult>;
}
