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
        className="w-full py-2 text-center text-sm text-white/55 hover:text-white/80"
        aria-expanded={open}
      >
        {open ? 'הגדרות מתקדמות ▴' : 'הגדרות מתקדמות ▾'}
      </button>

      {open ? (
        <div className="space-y-4 rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-white/60">מהירות ואיכות</p>
            <div className="flex flex-wrap gap-2">
              {MODEL_CHOICES.map(choice => {
                const isActive = selectedModel === choice.id;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => onModelChange(choice.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                      isActive
                        ? 'border-cyan-300 bg-cyan-400 text-zinc-950'
                        : 'border-white/20 bg-white/5 text-white/75 hover:bg-white/10'
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
            className="min-h-[80px] w-full resize-y rounded-xl border border-white/20 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 disabled:opacity-50"
          />
        </div>
      ) : null}
    </div>
  );
}
