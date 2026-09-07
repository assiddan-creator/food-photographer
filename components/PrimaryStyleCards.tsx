'use client';

import { Check } from 'lucide-react';
import {
  getPresetById,
  STYLE_FILTERS,
  type PresetId,
  type PrimaryPresetId,
  type StyleFilterId,
} from '@/lib/presets';

/** Same plated dish on every home card so the user compares style, not food. */
const SHARED_DISH = '/Grilled_ribeye_steak_with_fries_a9d6150853.jpeg';

const SELECTED_FRAME = 'glow-gold';

const PRIMARY_CARDS = [
  {
    id: 'delivery' as const,
    tag: 'משלוחים',
    subtitle: 'רקע מחמיא · מנה זהה · 16:9',
  },
  {
    id: 'tiktok' as const,
    tag: 'סטורי',
    subtitle: 'סטורי · 9:16',
  },
  {
    id: 'menu' as const,
    tag: 'תפריט',
    subtitle: 'תפריט',
  },
  {
    id: 'marketing' as const,
    tag: 'פרסום',
    subtitle: 'פרסום',
  },
  {
    id: 'live-fire' as const,
    tag: 'גריל',
    subtitle: 'גריל',
  },
  {
    id: 'auto' as const,
    tag: 'אוטומטי',
    subtitle: 'אוטומטי',
  },
] as const;

interface Props {
  selectedId: PresetId;
  filter: StyleFilterId;
  disabled?: boolean;
  onSelect: (id: PrimaryPresetId) => void;
  onFilterChange: (id: StyleFilterId) => void;
}

export function PrimaryStyleCards({
  selectedId,
  filter,
  disabled,
  onSelect,
  onFilterChange,
}: Props) {
  const visibleIds = new Set<string>(
    STYLE_FILTERS.find(item => item.id === filter)?.presetIds ?? PRIMARY_CARDS.map(card => card.id),
  );
  const cards = PRIMARY_CARDS.filter(card => visibleIds.has(card.id));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {STYLE_FILTERS.map(item => {
          const isActive = filter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => onFilterChange(item.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                isActive ? 'chip-on' : 'chip-off'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cards.map(card => {
          const preset = getPresetById(card.id);
          const isSelected = selectedId === card.id;
          return (
            <button
              key={card.id}
              type="button"
              aria-pressed={isSelected}
              disabled={disabled}
              onClick={() => onSelect(card.id)}
              className={`card-gold relative aspect-[5/4] min-h-[140px] overflow-hidden rounded-2xl p-3 text-right transition-all ${
                isSelected ? SELECTED_FRAME : ''
              } ${disabled ? 'pointer-events-none opacity-60' : 'hover:brightness-110'}`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${SHARED_DISH}')` }}
                aria-hidden
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10"
                aria-hidden
              />
              {isSelected ? (
                <span className="absolute top-2 left-2 flex size-6 items-center justify-center rounded-full bg-cta text-cta-ink shadow">
                  <Check size={14} strokeWidth={3} />
                </span>
              ) : null}
              <span className="absolute top-2 right-2 rounded-full bg-cta px-2 py-0.5 text-[10px] font-bold text-cta-ink">
                {card.tag}
              </span>
              <span className="relative flex h-full flex-col justify-end gap-0.5 pt-6">
                <span className="text-sm font-bold text-cream drop-shadow">{preset.title}</span>
                <span className="line-clamp-2 text-[11px] leading-snug text-cream/80">{card.subtitle}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
