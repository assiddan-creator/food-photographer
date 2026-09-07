'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, List } from 'lucide-react';
import {
  CATEGORY_LABELS,
  CATEGORY_PRESETS,
  MORE_STYLE_FILTER_IDS,
  PRESETS,
  PRIMARY_PRESET_IDS,
  type CategoryId,
  type PresetId,
  type StyleFilterId,
} from '@/lib/presets';

const PRIMARY_SET = new Set<string>(PRIMARY_PRESET_IDS);

const CATEGORY_ORDER: CategoryId[] = ['classics', 'creators', 'studio', 'cinema', 'social-ai'];

interface Props {
  selectedId: PresetId;
  filter: StyleFilterId;
  disabled?: boolean;
  forceOpen?: boolean;
  onSelect: (id: PresetId) => void;
}

export function MoreStylesPanel({ selectedId, filter, disabled, forceOpen, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<CategoryId>('classics');

  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  const remaining = useMemo(() => {
    const extraAllow = MORE_STYLE_FILTER_IDS[filter];
    const extraAllowSet = extraAllow ? new Set<string>(extraAllow) : null;
    return PRESETS.filter(preset => {
      if (PRIMARY_SET.has(preset.id)) return false;
      if (extraAllowSet && !extraAllowSet.has(preset.id)) return false;
      return true;
    });
  }, [filter]);

  const visibleCategories = useMemo(
    () =>
      CATEGORY_ORDER.filter(id =>
        remaining.some(preset => CATEGORY_PRESETS[id].includes(preset.id)),
      ),
    [remaining],
  );

  const activeCategory = visibleCategories.includes(category)
    ? category
    : visibleCategories[0];

  const cards = remaining.filter(preset =>
    activeCategory ? CATEGORY_PRESETS[activeCategory].includes(preset.id) : true,
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
          {visibleCategories.length > 1 ? (
            <div className="flex flex-wrap gap-2">
              {visibleCategories.map(id => {
                const isActive = activeCategory === id;
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
          ) : null}

          {cards.length === 0 ? (
            <p className="text-center text-xs text-white/40">אין סגנונות נוספים בסינון הזה</p>
          ) : (
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
                      className="absolute inset-0 bg-cover bg-center opacity-35"
                      style={{ backgroundImage: `url('${preset.image}')` }}
                      aria-hidden
                    />
                    <span className="relative flex items-center gap-1.5 text-sm font-semibold text-white">
                      {preset.id === 'ingredients' ? <List size={14} className="shrink-0 text-white/70" /> : null}
                      {preset.id === 'nutrition' ? <Activity size={14} className="shrink-0 text-white/70" /> : null}
                      {preset.title}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
