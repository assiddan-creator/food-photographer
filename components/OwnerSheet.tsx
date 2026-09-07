'use client';

import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  onBack: () => void;
  children: ReactNode;
}

export function OwnerSheet({ title, subtitle, onBack, children }: Props) {
  return (
    <div
      className="panel-gold space-y-4 rounded-2xl p-4 md:p-5"
      dir="rtl"
    >
      <div className="space-y-1">
        <h2 className="text-base font-bold text-cream">{title}</h2>
        {subtitle ? <p className="text-xs text-muted">{subtitle}</p> : null}
      </div>
      {children}
      <button
        type="button"
        onClick={onBack}
        className="btn-ghost w-full"
      >
        ← חזרה לפעולות
      </button>
    </div>
  );
}
