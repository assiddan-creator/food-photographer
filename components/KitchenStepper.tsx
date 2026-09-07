export const KITCHEN_STEPS = [
  { id: 'camera', label: 'מצלמה' },
  { id: 'check', label: 'בדיקה' },
  { id: 'style', label: 'סגנון' },
  { id: 'actions', label: 'פעולות' },
] as const;

export type KitchenStepId = (typeof KITCHEN_STEPS)[number]['id'];

const CAPTIONS: Record<KitchenStepId, string> = {
  camera: 'ברירת מחדל: מצלמה · העלאה משנית',
  check: 'אחרי צילום · ניתוח מהיר לפני סגנון',
  style: 'בחירת סגנון · 6 נעולים',
  actions: 'אחרי תוצאה · פעולות ברורות במסעדה',
};

interface Props {
  current: KitchenStepId;
}

export function KitchenStepper({ current }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {KITCHEN_STEPS.map((step, index) => {
          const active = step.id === current;
          return (
            <span
              key={step.id}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                active
                  ? 'border border-cyan-400 text-white'
                  : 'border border-transparent text-white/35'
              }`}
            >
              {index + 1} · {step.label}
            </span>
          );
        })}
      </div>
      <p className="text-center text-xs text-white/40">{CAPTIONS[current]}</p>
    </div>
  );
}
