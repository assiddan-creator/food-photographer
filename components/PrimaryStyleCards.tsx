'use client';

import { Sparkles, Smartphone, Truck, UtensilsCrossed } from 'lucide-react';
import { getPresetById, type PresetId } from '@/lib/presets';

const PRIMARY_CARDS = [
  {
    id: 'delivery' as const,
    title: 'מוכן לוולט',
    subtitle: '16:9 · שיפור עדין',
    Icon: Truck,
    selected:
      'border-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.35)]',
    idle: 'border-cyan-400/55',
    iconClass: 'text-cyan-300',
  },
  {
    id: 'tiktok' as const,
    title: 'לטיקטוק',
    subtitle: '9:16 · ריל / סטורי',
    Icon: Smartphone,
    selected:
      'border-rose-400 shadow-[0_0_24px_rgba(251,113,133,0.35)]',
    idle: 'border-rose-400/55',
    iconClass: 'text-rose-300',
  },
  {
    id: 'menu' as const,
    title: 'תפריט יוקרתי',
    subtitle: 'מראה מסעדה',
    Icon: UtensilsCrossed,
    selected:
      'border-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.35)]',
    idle: 'border-amber-400/55',
    iconClass: 'text-amber-300',
  },
  {
    id: 'auto' as const,
    title: 'שיפור חכם',
    subtitle: 'אוטומטי',
    Icon: Sparkles,
    selected:
      'border-violet-400 shadow-[0_0_24px_rgba(167,139,250,0.35)]',
    idle: 'border-violet-400/55',
    iconClass: 'text-violet-300',
  },
] as const;

interface Props {
  selectedId: PresetId;
  disabled?: boolean;
  onSelect: (id: PresetId) => void;
}

export function PrimaryStyleCards({ selectedId, disabled, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {PRIMARY_CARDS.map(card => {
        const preset = getPresetById(card.id);
        const isSelected = selectedId === card.id;
        const { Icon } = card;
        return (
          <button
            key={card.id}
            type="button"
            aria-pressed={isSelected}
            disabled={disabled}
            onClick={() => onSelect(card.id)}
            className={`relative min-h-[112px] overflow-hidden rounded-2xl border-2 p-3 text-right transition-all ${
              isSelected ? card.selected : card.idle
            } ${disabled ? 'opacity-60 pointer-events-none' : 'hover:brightness-110'}`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${preset.image}')` }}
              aria-hidden
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/20" aria-hidden />
            <span className="relative flex h-full flex-col justify-end gap-0.5">
              <span className="flex items-center gap-1.5 text-sm font-bold text-white">
                <Icon size={14} className={`shrink-0 ${card.iconClass}`} />
                {card.title}
              </span>
              <span className="text-[11px] text-white/70">{card.subtitle}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
