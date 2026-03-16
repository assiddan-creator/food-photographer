import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface Props extends HTMLAttributes<HTMLDivElement> {
  intensity?: 'low' | 'medium' | 'high';
}

const intensityMap = {
  low: 'bg-white/5 backdrop-blur-sm',
  medium: 'bg-white/10 backdrop-blur-md',
  high: 'bg-white/20 backdrop-blur-xl',
};

export function GlassCard({ children, className, intensity = 'medium', ...props }: Props) {
  return (
    <div
      className={cn('rounded-2xl border border-white/20 shadow-xl', intensityMap[intensity], className)}
      {...props}
    >
      {children}
    </div>
  );
}
