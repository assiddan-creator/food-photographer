'use client';

import { Camera, Check, Upload, X } from 'lucide-react';
import type { PhotoQaResult } from '@/lib/photo-qa';

type QaStatus = 'checking' | 'fail' | 'error';

interface Props {
  preview: string;
  status: QaStatus;
  result: PhotoQaResult | null;
  errorMessage?: string | null;
  onRetake: () => void;
  onGallery: () => void;
  onContinueAnyway: () => void;
}

function CheckRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        ok ? 'bg-emerald-500/15 text-emerald-200' : 'bg-amber-500/15 text-amber-100'
      }`}
    >
      {ok ? <Check size={12} /> : <X size={12} />}
      {label}
    </span>
  );
}

export function PhotoQaCard({
  preview,
  status,
  result,
  errorMessage,
  onRetake,
  onGallery,
  onContinueAnyway,
}: Props) {
  const isChecking = status === 'checking';

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
        <img src={preview} alt="התמונה שצולמה" className="aspect-square w-full object-contain" />
      </div>

      {isChecking ? (
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
          <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-cyan-300/30 border-t-cyan-300" />
          בודקים פוקוס, תאורה והאם כל המנה בפריים…
        </div>
      ) : null}

      {status === 'fail' && result ? (
        <div className="space-y-3 rounded-xl border border-amber-400/40 bg-amber-500/10 p-4">
          <p className="text-base font-bold text-amber-50">צלם שוב: {result.tipHe}</p>
          <div className="flex flex-wrap gap-2">
            <CheckRow ok={result.focusOk} label="פוקוס" />
            <CheckRow ok={result.lightingOk} label="תאורה" />
            <CheckRow ok={result.framingOk} label="כל המנה" />
          </div>
          {result.issues.length > 0 ? (
            <p className="text-xs text-amber-100/80">{result.issues.join(' · ')}</p>
          ) : null}
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="space-y-2 rounded-xl border border-white/15 bg-white/5 p-4">
          <p className="font-semibold text-white">לא הצלחנו לבדוק את התמונה</p>
          <p className="text-sm text-white/60">
            {errorMessage || 'אפשר לצלם שוב, או להמשיך לבחירת סגנון.'}
          </p>
        </div>
      ) : null}

      {!isChecking ? (
        <div className="space-y-3">
          <button
            type="button"
            onClick={onRetake}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 py-3.5 text-base font-bold text-zinc-950 hover:bg-cyan-300"
          >
            <Camera size={18} />
            צלם שוב
          </button>
          <button
            type="button"
            onClick={onGallery}
            className="mx-auto flex items-center gap-1.5 text-sm text-white/45 hover:text-white/80"
          >
            <Upload size={14} />
            העלאה מהגלריה
          </button>
          <button
            type="button"
            onClick={onContinueAnyway}
            className="mx-auto block text-xs text-white/35 hover:text-white/60"
          >
            המנה נראית בסדר — המשך
          </button>
        </div>
      ) : null}
    </div>
  );
}
