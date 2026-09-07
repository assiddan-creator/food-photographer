'use client';

interface Props {
  onClick: () => void;
  disabled?: boolean;
}

export function BackToCameraButton({ onClick, disabled }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center rounded-2xl border border-white/20 bg-transparent px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-40"
    >
      ← חזרה למצלמה
    </button>
  );
}
