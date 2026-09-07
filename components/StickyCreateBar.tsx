'use client';

interface Props {
  hasImage: boolean;
  isRunning: boolean;
  isAnalyzing: boolean;
  onGenerate: () => void;
  onAnalyze: () => void;
}

export function StickyCreateBar({
  hasImage,
  isRunning,
  isAnalyzing,
  onGenerate,
  onAnalyze,
}: Props) {
  if (!hasImage) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 bg-black">
      <div className="pointer-events-auto mx-auto flex max-w-4xl flex-col gap-2 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-8">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isRunning}
          className="w-full rounded-2xl bg-cyan-400 py-3.5 text-sm font-bold text-zinc-950 transition-all hover:bg-cyan-300 disabled:opacity-50"
        >
          {isRunning ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950/30 border-t-zinc-950" />
              מעבד…
            </span>
          ) : (
            'צור תמונה משופרת'
          )}
        </button>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={isAnalyzing || isRunning}
          className="w-full rounded-2xl border border-white/25 bg-transparent py-3 text-sm font-semibold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isAnalyzing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              מנתח את המנה…
            </span>
          ) : (
            'נתח את המנה'
          )}
        </button>
      </div>
    </div>
  );
}
