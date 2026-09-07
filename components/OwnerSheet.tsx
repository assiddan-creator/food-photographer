'use client';

import type { ReactNode } from 'react';

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function OwnerSheet({ open, title, onClose, children }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" dir="rtl">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-label="סגור"
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-3xl border-t border-white/15 bg-zinc-950 px-4 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(0,0,0,0.45)]">
        <div className="mx-auto max-w-lg space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-white">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-3 py-1 text-sm text-white/55 hover:text-white"
            >
              סגור
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
