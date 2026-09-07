import type { FalModelId } from '@/lib/fal-generate';

/** Hebrew labels for the advanced model picker — never show raw Fal ids in the UI. */
export const MODEL_CHOICES: ReadonlyArray<{
  id: FalModelId;
  label: string;
  hint: string;
}> = [
  { id: 'fal-ai/nano-banana/edit', label: 'מאוזן', hint: 'ברירת מחדל' },
  { id: 'fal-ai/nano-banana-2/edit', label: 'מהיר', hint: 'תוצאה מהירה יותר' },
  { id: 'fal-ai/nano-banana-pro/edit', label: 'איכות', hint: 'פירוט גבוה יותר' },
  { id: 'fal-ai/bytedance/seedream/v5/lite/edit', label: 'סטודיו', hint: 'מראה פרסומי' },
  { id: 'fal-ai/flux-2-pro/edit', label: 'פילם', hint: 'מראה קולנועי' },
];

export const DEFAULT_FAL_MODEL: FalModelId = 'fal-ai/nano-banana/edit';
