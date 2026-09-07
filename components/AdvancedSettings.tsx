'use client';

import { useState } from 'react';
import { MODEL_CHOICES } from '@/lib/model-labels';
import type { FalModelId } from '@/lib/fal-generate';

interface Props {
  selectedModel: FalModelId;
  customPrompt: string;
  disabled?: boolean;
  onModelChange: (id: FalModelId) => void;
  onCustomPromptChange: (value: string) => void;
}

export function AdvancedSettings({
  selectedModel,
  customPrompt,
  disabled,
  onModelChange,
  onCustomPromptChange,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="w-full py-2 text-center text-sm text-muted hover:text-cream"
        aria-expanded={open}
      >
        {open ? 'הגדרות מתקדמות ▴' : 'הגדרות מתקדמות ▾'}
      </button>

      {open ? (
        <div className="panel-gold space-y-4 rounded-2xl p-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted">מהירות ואיכות</p>
            <div className="flex flex-wrap gap-2">
              {MODEL_CHOICES.map(choice => {
                const isActive = selectedModel === choice.id;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => onModelChange(choice.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                      isActive ? 'chip-on' : 'chip-off'
                    }`}
                    title={choice.hint}
                  >
                    {choice.label}
                    {choice.id === 'fal-ai/nano-banana/edit' ? (
                      <span className="mr-1 text-[10px] opacity-70"> · ברירת מחדל</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <textarea
            dir="rtl"
            value={customPrompt}
            onChange={e => onCustomPromptChange(e.target.value)}
            placeholder="כתוב חופשי: איפה תרצה לצלם את המנה? (אופציונלי)"
            disabled={disabled}
            rows={3}
            className="field-gold min-h-[80px] w-full resize-y rounded-xl px-4 py-3 text-sm disabled:opacity-50"
          />
        </div>
      ) : null}
    </div>
  );
}
