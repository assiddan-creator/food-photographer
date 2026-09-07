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
  idle: 'from-muted to-muted',
  generating: 'from-cta to-cta',
  done: 'from-cta to-cta',
  error: 'from-[#9a3b32] to-[#7a2e28]',
};

export function GenerationStatus({
  stage,
  progress,
  statusMessage,
}: {
  stage: PipelineStage;
  progress: number;
  statusMessage: string;
  variant?: 'dark';
}) {
  return (
    <GlassCard className="p-5 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-cream">{LABELS[stage]}</span>
        <span className="text-xs tabular-nums text-muted">{progress}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-bg">
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
      className="text-xs text-muted"
    >
      {message}
    </motion.p>
  );
}
