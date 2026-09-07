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
      className="btn-ghost px-3 py-2 text-cream/90"
    >
      ← חזרה למצלמה
    </button>
  );
}
