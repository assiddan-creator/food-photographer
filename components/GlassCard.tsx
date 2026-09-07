import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface Props extends HTMLAttributes<HTMLDivElement> {
  intensity?: 'low' | 'medium' | 'high';
}

const intensityMap = {
  low: 'bg-surface',
  medium: 'bg-frame',
  high: 'bg-surface',
};

export function GlassCard({ children, className, intensity = 'medium', ...props }: Props) {
  return (
    <div
      className={cn('rounded-2xl border border-cta/70 shadow-[0_0_24px_rgba(0,0,0,0.35)]', intensityMap[intensity], className)}
      {...props}
    >
      {children}
    </div>
  );
}
