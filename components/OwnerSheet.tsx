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
      className="space-y-4 rounded-2xl border border-white/10 bg-black p-4 md:p-5"
      dir="rtl"
    >
      <div className="space-y-1">
        <h2 className="text-base font-bold text-white">{title}</h2>
        {subtitle ? <p className="text-xs text-white/50">{subtitle}</p> : null}
      </div>
      {children}
      <button
        type="button"
        onClick={onBack}
        className="w-full rounded-2xl border border-white/20 bg-transparent py-3 text-sm font-semibold text-white hover:bg-white/10"
      >
        ← חזרה לפעולות
      </button>
    </div>
  );
}
