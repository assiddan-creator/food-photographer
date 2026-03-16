import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function analyzeFoodImage(
  imageBase64: string,
  mimeType: string,
  systemPrompt: string,
): Promise<unknown> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
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
      return JSON.parse(text);
    } catch (parseErr) {
      throw new Error(`Failed to parse Gemini JSON response: ${(parseErr as Error).message}`);
    }
  } catch (err) {
    throw new Error(`analyzeFoodImage failed: ${(err as Error).message}`);
  }
}

