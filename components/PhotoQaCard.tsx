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
    return <span className="spinner-gold h-5 w-5 shrink-0 animate-spin rounded-full" />;
  }
  if (ok) {
    return (
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-cta text-cta-ink">
        <Check size={16} strokeWidth={3} />
      </span>
    );
  }
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-cta bg-surface text-cta">
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
    <div className="flex items-start gap-3 rounded-xl bg-bg px-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-cream">{label}</p>
        <p className="text-xs leading-relaxed text-muted">
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
      <div className="card-gold overflow-hidden rounded-3xl">
        <img src={preview} alt="התמונה שצולמה" className="aspect-[3/4] w-full object-cover sm:aspect-[4/5]" />
      </div>

      {errorMessage && !result ? (
        <p className="text-xs text-muted">לא הצלחנו לבדוק אוטומטית — אפשר להמשיך או לצלם שוב.</p>
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

      <button type="button" onClick={onContinue} disabled={isChecking} className="btn-cta w-full">
        הצילום טוב — המשך לסגנון
      </button>
      <button type="button" onClick={onRetake} className="btn-ghost w-full">
        צלם שוב
      </button>
      <p className="text-center text-[11px] text-muted">
        לא חוסמים על אזהרה קלה — רק מדריכים. «צלם שוב» תמיד זמין.
      </p>
    </div>
  );
}
