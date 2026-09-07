'use client';

import { Camera, Upload } from 'lucide-react';

interface Props {
  onOpenCamera: () => void;
  onOpenGallery: () => void;
  disabled?: boolean;
}

export function CameraFirstEmpty({ onOpenCamera, onOpenGallery, disabled }: Props) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed border-cyan-400/40 bg-cyan-400/5 px-5 py-12 md:min-h-[320px]">
      <div className="flex size-20 items-center justify-center rounded-full bg-cyan-400 text-zinc-950 shadow-[0_0_40px_rgba(34,211,238,0.45)]">
        <Camera size={38} strokeWidth={2.25} />
      </div>

      <button
        type="button"
        onClick={onOpenCamera}
        disabled={disabled}
        className="w-full max-w-sm rounded-2xl bg-cyan-400 py-4 text-lg font-bold text-zinc-950 shadow-[0_0_28px_rgba(34,211,238,0.35)] transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
      >
        צלם מנה
      </button>

      <p className="text-sm text-white/50">פותח את המצלמה האחורית לצילום המנה</p>

      <button
        type="button"
        onClick={onOpenGallery}
        disabled={disabled}
        className="text-sm text-white/45 underline-offset-4 hover:text-white/80 hover:underline disabled:opacity-40"
      >
        <span className="inline-flex items-center gap-1.5">
          <Upload size={14} />
          העלאה מהגלריה
        </span>
      </button>
    </div>
  );
}
