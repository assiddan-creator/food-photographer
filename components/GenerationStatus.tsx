'use client';

import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { type PipelineStage } from '@/hooks/usePipeline';

const LABELS: Record<PipelineStage, string> = {
  idle: 'מוכן למשימה',
  generating: 'מייצר קסמים...',
  done: 'הושלם בהצלחה',
  error: 'שגיאה',
};

const BAR_COLORS: Record<PipelineStage, string> = {
  idle: 'from-slate-500 to-slate-600',
  generating: 'from-violet-500 to-purple-600',
  done: 'from-emerald-500 to-green-500',
  error: 'from-red-500 to-rose-600',
};

export function GenerationStatus({
  stage,
  progress,
  statusMessage,
  variant = 'dark',
}: {
  stage: PipelineStage;
  progress: number;
  statusMessage: string;
  variant?: 'dark';
}) {
  return (
    <GlassCard className="p-5 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-white">{LABELS[stage]}</span>
        <span className="text-xs tabular-nums text-white/50">{progress}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden bg-white/10">
        <motion.div
          className={`h-full bg-gradient-to-r ${BAR_COLORS[stage]} rounded-full`}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <AnimatedMessage message={statusMessage} />
    </GlassCard>
  );
}

function AnimatedMessage({ message }: { message: string }) {
  return (
    <motion.p
      key={message}
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-xs text-white/50"
    >
      {message}
    </motion.p>
  );
}
