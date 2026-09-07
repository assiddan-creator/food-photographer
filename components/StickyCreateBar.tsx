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
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 bg-bg">
      <div className="pointer-events-auto mx-auto flex max-w-4xl flex-col gap-2 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-8">
        <button type="button" onClick={onGenerate} disabled={isRunning} className="btn-cta w-full">
          {isRunning ? (
            <>
              <span className="spinner-ink h-4 w-4 animate-spin rounded-full" />
              מעבד…
            </>
          ) : (
            'צור תמונה משופרת'
          )}
        </button>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={isAnalyzing || isRunning}
          className="btn-ghost w-full"
        >
          {isAnalyzing ? (
            <>
              <span className="spinner-gold h-4 w-4 animate-spin rounded-full" />
              מנתח את המנה…
            </>
          ) : (
            'נתח את המנה'
          )}
        </button>
      </div>
    </div>
  );
}
