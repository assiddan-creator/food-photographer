'use client';

import { Check } from 'lucide-react';
import {
  getPresetById,
  STYLE_FILTERS,
  type PresetId,
  type PrimaryPresetId,
  type StyleFilterId,
} from '@/lib/presets';

const PRIMARY_CARDS = [
  {
    id: 'delivery' as const,
    tag: 'משלוחים',
    subtitle: '16:9 · שיפור עדין לתפריט משלוחים',
    selected: 'border-cyan-400 shadow-[0_0_28px_rgba(34,211,238,0.4)]',
    idle: 'border-cyan-400/50',
    tagClass: 'bg-cyan-400/90 text-zinc-950',
  },
  {
    id: 'tiktok' as const,
    tag: 'סטורי',
    subtitle: '9:16 · ריל · טיקטוק · אינסטגרם',
    selected: 'border-rose-400 shadow-[0_0_28px_rgba(251,113,133,0.4)]',
    idle: 'border-rose-400/50',
    tagClass: 'bg-rose-400/90 text-zinc-950',
  },
  {
    id: 'menu' as const,
    tag: 'תפריט',
    subtitle: 'מראה יוקרתי',
    selected: 'border-amber-400 shadow-[0_0_28px_rgba(251,191,36,0.4)]',
    idle: 'border-amber-400/50',
    tagClass: 'bg-amber-400/90 text-zinc-950',
  },
  {
    id: 'marketing' as const,
    tag: 'פרסום',
    subtitle: 'תנועה · מודעה',
    selected: 'border-orange-400 shadow-[0_0_28px_rgba(251,146,60,0.4)]',
    idle: 'border-orange-400/50',
    tagClass: 'bg-orange-400/90 text-zinc-950',
  },
  {
    id: 'live-fire' as const,
    tag: 'גריל',
    subtitle: 'חום · עשן · תחושת בשר חם',
    selected: 'border-red-500 shadow-[0_0_28px_rgba(239,68,68,0.4)]',
    idle: 'border-red-500/50',
    tagClass: 'bg-red-500/90 text-white',
  },
  {
    id: 'auto' as const,
    tag: 'אוטומטי',
    subtitle: 'בחירה בטוחה · בלי להתלבט',
    selected: 'border-violet-400 shadow-[0_0_28px_rgba(167,139,250,0.4)]',
    idle: 'border-violet-400/50',
    tagClass: 'bg-violet-400/90 text-zinc-950',
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
                isActive
                  ? 'bg-white text-zinc-950'
                  : 'border border-white/15 bg-white/5 text-white/70 hover:bg-white/10'
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
              className={`relative aspect-[5/4] min-h-[140px] overflow-hidden rounded-2xl border-2 p-3 text-right shadow-lg transition-all ${
                isSelected ? card.selected : card.idle
              } ${disabled ? 'pointer-events-none opacity-60' : 'hover:brightness-110'}`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${preset.image}')` }}
                aria-hidden
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10"
                aria-hidden
              />
              {isSelected ? (
                <span className="absolute top-2 left-2 flex size-6 items-center justify-center rounded-full bg-white text-zinc-950 shadow">
                  <Check size={14} strokeWidth={3} />
                </span>
              ) : null}
              <span className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${card.tagClass}`}>
                {card.tag}
              </span>
              <span className="relative flex h-full flex-col justify-end gap-0.5 pt-6">
                <span className="text-sm font-bold text-white drop-shadow">{preset.title}</span>
                <span className="line-clamp-2 text-[11px] leading-snug text-white/75">{card.subtitle}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
