'use client';

import { AlertTriangle, Check } from 'lucide-react';
import type { PhotoQaResult } from '@/lib/photo-qa';

interface Props {
  preview: string;
  isChecking: boolean;
  result: PhotoQaResult | null;
  errorMessage?: string | null;
  onContinue: () => void;
  onRetake: () => void;
}

function StatusIcon({ ok, checking }: { ok: boolean; checking: boolean }) {
  if (checking) {
    return <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-white/25 border-t-cyan-300" />;
  }
  if (ok) {
    return (
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-zinc-950">
        <Check size={16} strokeWidth={3} />
      </span>
    );
  }
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-400 text-zinc-950">
      <AlertTriangle size={14} strokeWidth={2.5} />
    </span>
  );
}

function CheckRow({
  label,
  note,
  ok,
  checking,
}: {
  label: string;
  note: string;
  ok: boolean;
  checking: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-black/30 px-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-white">{label}</p>
        <p className="text-xs leading-relaxed text-white/60">
          {checking ? 'בודקים…' : note}
        </p>
      </div>
      <StatusIcon ok={ok} checking={checking} />
    </div>
  );
}

export function PhotoQaCard({
  preview,
  isChecking,
  result,
  errorMessage,
  onContinue,
  onRetake,
}: Props) {
  const focusOk = result?.focusOk ?? false;
  const lightingOk = result?.lightingOk ?? false;
  const framingOk = result?.framingOk ?? false;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-black">
        <img src={preview} alt="התמונה שצולמה" className="aspect-[3/4] w-full object-cover sm:aspect-[4/5]" />
      </div>

      {errorMessage && !result ? (
        <p className="text-xs text-white/45">לא הצלחנו לבדוק אוטומטית — אפשר להמשיך או לצלם שוב.</p>
      ) : null}

      <div className="space-y-2">
        <CheckRow
          label="פוקוס"
          note={result?.focusNoteHe ?? ''}
          ok={focusOk}
          checking={isChecking}
        />
        <CheckRow
          label="תאורה"
          note={result?.lightingNoteHe ?? ''}
          ok={lightingOk}
          checking={isChecking}
        />
        <CheckRow
          label="מנה שלמה"
          note={result?.framingNoteHe ?? ''}
          ok={framingOk}
          checking={isChecking}
        />
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={isChecking}
        className="w-full rounded-2xl bg-cyan-400 py-3.5 text-sm font-bold text-zinc-950 hover:bg-cyan-300 disabled:opacity-40"
      >
        הצילום טוב — המשך לסגנון
      </button>
      <button
        type="button"
        onClick={onRetake}
        className="w-full rounded-2xl border border-white/20 bg-transparent py-3 text-sm font-semibold text-white hover:bg-white/10"
      >
        צלם שוב
      </button>
      <p className="text-center text-[11px] text-white/35">
        לא חוסמים על אזהרה קלה — רק מדריכים. «צלם שוב» תמיד זמין.
      </p>
    </div>
  );
}
