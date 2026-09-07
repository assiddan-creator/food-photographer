'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, List, Rocket } from 'lucide-react';
import {
  CATEGORY_LABELS,
  CATEGORY_PRESETS,
  PRESETS,
  PRIMARY_PRESET_IDS,
  type CategoryId,
  type PresetId,
} from '@/lib/presets';

const PRIMARY_SET = new Set<string>(PRIMARY_PRESET_IDS);

const CATEGORY_ORDER: CategoryId[] = ['classics', 'creators', 'studio', 'cinema', 'social-ai'];

interface Props {
  selectedId: PresetId;
  disabled?: boolean;
  forceOpen?: boolean;
  onSelect: (id: PresetId) => void;
}

export function MoreStylesPanel({ selectedId, disabled, forceOpen, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<CategoryId>('classics');

  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  const visibleCategories = useMemo(
    () =>
      CATEGORY_ORDER.filter(id =>
        CATEGORY_PRESETS[id].some(presetId => !PRIMARY_SET.has(presetId)),
      ),
    [],
  );

  const cards = PRESETS.filter(
    preset =>
      CATEGORY_PRESETS[category].includes(preset.id) && !PRIMARY_SET.has(preset.id),
  );

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="w-full py-2 text-center text-sm text-white/55 hover:text-white/80"
        aria-expanded={open}
      >
        {open ? 'עוד סגנונות ▴' : 'עוד סגנונות ▾'}
      </button>

      {open ? (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {visibleCategories.map(id => {
              const isActive = category === id;
              return (
                <button
                  key={id}
                  type="button"
                  disabled={disabled}
                  onClick={() => setCategory(id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'border-white bg-white text-black'
                      : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {CATEGORY_LABELS[id]}
                </button>
              );
            })}
          </div>
          <div className="grid max-h-[240px] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-4">
            {cards.map(preset => {
              const isSelected = selectedId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelect(preset.id)}
                  className={`relative min-h-[88px] overflow-hidden rounded-xl border p-3 text-right transition-all ${
                    isSelected
                      ? 'border-violet-400 bg-white/10 shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-30"
                    style={{ backgroundImage: `url('${preset.image}')` }}
                    aria-hidden
                  />
                  <span className="relative flex items-center gap-1.5 text-sm font-semibold text-white">
                    {preset.id === 'marketing' ? <Rocket size={14} className="shrink-0 text-violet-300" /> : null}
                    {preset.id === 'ingredients' ? <List size={14} className="shrink-0 text-white/70" /> : null}
                    {preset.id === 'nutrition' ? <Activity size={14} className="shrink-0 text-white/70" /> : null}
                    {preset.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
