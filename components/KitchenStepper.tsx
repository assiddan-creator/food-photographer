export const KITCHEN_STEPS = [
  { id: 'camera', label: 'מצלמה' },
  { id: 'check', label: 'בדיקה' },
  { id: 'style', label: 'סגנון' },
  { id: 'actions', label: 'פעולות' },
] as const;

export type KitchenStepId = (typeof KITCHEN_STEPS)[number]['id'];

const CAPTIONS: Record<KitchenStepId, string> = {
  camera: 'צלמו את המנה עכשיו — העלאה רק אם אי אפשר לצלם',
  check: 'אחרי צילום · ניתוח מהיר לפני סגנון',
  style: 'בחירת סגנון · 6 נעולים',
  actions: 'התמונה מוכנה · בלי קלוריות — רק מה שמוכר',
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
                active ? 'chip-on' : 'border border-transparent text-muted'
              }`}
            >
              {index + 1} · {step.label}
            </span>
          );
        })}
      </div>
      <p className="text-center text-xs text-muted">{CAPTIONS[current]}</p>
    </div>
  );
}
