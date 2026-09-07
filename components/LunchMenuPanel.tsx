'use client';

import { useEffect, useMemo, useState } from 'react';
import { Clock } from 'lucide-react';
import { useDishLibrary } from '@/hooks/useDishLibrary';
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings';
import {
  LUNCH_MAX_DISHES,
  LUNCH_MIN_DISHES,
  LUNCH_SEND_HINT,
  buildLunchWhatsAppText,
} from '@/lib/lunch-copy';
import { copyText, fetchImageFile, shareImagesWithText } from '@/lib/owner-share';
import { getCustomerWhatsAppHref } from '@/lib/whatsapp';
import { WhatsAppMark } from '@/components/WhatsAppMark';
import type { EnhancedDish } from '@/lib/dish-library';

type LunchTab = 'pick' | 'message';

const TABS: { id: LunchTab; label: string }[] = [
  { id: 'pick', label: 'בחירת מנות' },
  { id: 'message', label: 'הודעה למשרד' },
];

interface Props {
  onOpenSettings?: () => void;
  onGoSingle?: () => void;
  onGoBatch?: () => void;
}

export function LunchMenuPanel({ onOpenSettings, onGoSingle, onGoBatch }: Props) {
  const { dishes, updateDish } = useDishLibrary();
  const { resolved } = useRestaurantSettings();
  const [tab, setTab] = useState<LunchTab>('pick');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const selected = useMemo(
    () =>
      selectedIds
        .map(id => dishes.find(dish => dish.id === id))
        .filter((dish): dish is EnhancedDish => Boolean(dish)),
    [dishes, selectedIds],
  );

  const selectedCount = selected.length;
  const canContinue =
    selectedCount >= LUNCH_MIN_DISHES && selectedCount <= LUNCH_MAX_DISHES;

  useEffect(() => {
    setMessage(
      buildLunchWhatsAppText({
        businessName: resolved.name,
        dishes: selected.map(dish => ({ name: dish.name, price: dish.price })),
      }),
    );
  }, [resolved.name, selected]);

  const goMessage = () => {
    if (!canContinue) {
      setNotice(`בחרו ${LUNCH_MIN_DISHES}–${LUNCH_MAX_DISHES} מנות כדי להמשיך.`);
      return;
    }
    setNotice(null);
    setStatus(null);
    setTab('message');
  };

  const pickTab = (id: LunchTab) => {
    if (id === 'message' && !canContinue) {
      setNotice(`בחרו ${LUNCH_MIN_DISHES}–${LUNCH_MAX_DISHES} מנות כדי להמשיך.`);
      return;
    }
    setNotice(null);
    setStatus(null);
    setTab(id);
  };

  const toggleDish = (id: string) => {
    setNotice(null);
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(item => item !== id);
      if (prev.length >= LUNCH_MAX_DISHES) {
        setNotice(`אפשר עד ${LUNCH_MAX_DISHES} מנות לצהריים.`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleCopy = async () => {
    const ok = await copyText(message);
    setStatus(ok ? 'הטקסט הועתק' : 'לא הצלחנו להעתיק. העתיקו ידנית.');
  };

  const handleOpenWhatsApp = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const files = await Promise.all(
        selected.map((dish, index) =>
          fetchImageFile(dish.imageUrl, `lunch-${index + 1}.jpg`),
        ),
      );
      const result = await shareImagesWithText({
        files,
        text: message,
        title: 'תפריט צהריים',
      });
      if (result === 'shared') {
        setStatus('התמונות והטקסט מוכנים לשליחה');
        return;
      }
      if (result === 'aborted') return;
      window.open(
        getCustomerWhatsAppHref(message, resolved.whatsapp),
        '_blank',
        'noopener,noreferrer',
      );
      setStatus('הדביקו את הטקסט וצרפו את תמונות המנות בוואטסאפ.');
    } catch {
      window.open(
        getCustomerWhatsAppHref(message, resolved.whatsapp),
        '_blank',
        'noopener,noreferrer',
      );
      setStatus('הדביקו את הטקסט וצרפו את תמונות המנות בוואטסאפ.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5" dir="rtl">
      <div className="panel-gold flex overflow-hidden rounded-2xl p-1">
        {TABS.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => pickTab(item.id)}
            aria-pressed={tab === item.id}
            className={`flex flex-1 items-center justify-center rounded-xl py-3 text-sm font-bold transition-all ${
              tab === item.id ? 'chip-on' : 'text-muted hover:text-cream'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {notice ? (
        <p className="rounded-xl border border-cta/40 bg-cta/10 px-3 py-2 text-sm text-cream">
          {notice}
        </p>
      ) : null}

      {tab === 'pick' ? (
        <div className="panel-gold space-y-4 rounded-2xl p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full border border-cta/50 px-2.5 py-1 text-[11px] font-semibold text-cta">
              מצב יום · צהריים
            </span>
            <p className="text-sm text-cream">
              נבחרו {selectedCount} מנות
              <span className="mr-2 text-xs text-muted">
                מינימום {LUNCH_MIN_DISHES} · מקסימום {LUNCH_MAX_DISHES}
              </span>
            </p>
          </div>

          {dishes.length === 0 ? (
            <div className="space-y-3 py-6 text-center">
              <p className="font-semibold text-cream">עדיין אין מנות משופרות</p>
              <p className="text-sm leading-relaxed text-muted">
                צלמו מנה אחת או תפריט שלם — ואז בחרו מכאן בלי לצלם שוב.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                {onGoSingle ? (
                  <button type="button" onClick={onGoSingle} className="btn-cta flex-1">
                    למנה אחת
                  </button>
                ) : null}
                {onGoBatch ? (
                  <button type="button" onClick={onGoBatch} className="btn-ghost flex-1">
                    לתפריט שלם
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3">
              {dishes.map(dish => {
                const active = selectedIds.includes(dish.id);
                return (
                  <li key={dish.id}>
                    <div
                      className={`overflow-hidden rounded-xl ${
                        active ? 'card-gold' : 'border border-transparent bg-surface'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleDish(dish.id)}
                        aria-pressed={active}
                        className="relative block w-full"
                      >
                        <img
                          src={dish.imageUrl}
                          alt={dish.name || 'מנה משופרת'}
                          className="aspect-[4/3] w-full object-cover"
                        />
                        {active ? (
                          <span className="absolute top-2 start-2 rounded-full bg-cta px-2 py-0.5 text-[10px] font-bold text-cta-ink">
                            נבחר
                          </span>
                        ) : null}
                      </button>
                      <div className="space-y-0.5 px-2.5 py-2">
                        <input
                          type="text"
                          dir="rtl"
                          value={dish.name}
                          onChange={e => updateDish(dish.id, { name: e.target.value })}
                          placeholder="שם מנה"
                          className="w-full bg-transparent text-sm font-semibold text-cream outline-none placeholder:text-muted"
                        />
                        <input
                          type="text"
                          dir="rtl"
                          inputMode="decimal"
                          value={dish.price}
                          onChange={e => updateDish(dish.id, { price: e.target.value })}
                          placeholder="מחיר ₪"
                          className="w-full bg-transparent text-xs text-muted outline-none placeholder:text-muted/70"
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <p className="text-center text-xs leading-relaxed text-muted">
            אותן תמונות שכבר שופרו באפליקציה · בלי צילום מחדש
          </p>

          <button
            type="button"
            onClick={goMessage}
            disabled={!canContinue}
            className="btn-cta w-full"
          >
            המשך להודעה
          </button>
        </div>
      ) : (
        <div className="panel-gold space-y-4 rounded-2xl p-4 md:p-5">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-cta/50 px-2.5 py-1 text-[11px] font-semibold text-cta">
              קבוצת וואטסאפ · משרד
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-cta/50 px-2.5 py-1 text-[11px] font-semibold text-cta">
              <Clock size={12} />
              {LUNCH_SEND_HINT}
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {selected.map(dish => (
              <img
                key={dish.id}
                src={dish.imageUrl}
                alt={dish.name || 'מנה'}
                className="h-16 w-16 shrink-0 rounded-lg object-cover"
              />
            ))}
          </div>

          <div className="flex justify-start">
            <div className="card-gold max-w-[90%] overflow-hidden rounded-2xl rounded-tl-sm text-cream shadow-lg">
              <textarea
                dir="rtl"
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={10}
                className="w-full resize-y bg-transparent px-3 py-2.5 text-sm leading-relaxed text-cream outline-none"
              />
            </div>
          </div>

          {!resolved.name || !resolved.whatsapp ? (
            <div className="rounded-xl border border-[color:var(--gold-border)] px-3 py-2.5 text-[11px] leading-relaxed text-muted">
              {!resolved.name ? <p>אין שם מסעדה בהגדרות — ההודעה תישלח בלי שם העסק.</p> : null}
              {!resolved.whatsapp ? <p>אין מספר וואטסאפ. אפשר עדיין לפתוח שיתוף כללי.</p> : null}
              {onOpenSettings ? (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="mt-2 text-xs font-semibold text-cta"
                >
                  להגדרות מסעדה
                </button>
              ) : null}
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => void handleOpenWhatsApp()}
            disabled={busy || !message.trim() || selectedCount < LUNCH_MIN_DISHES}
            className="btn-cta w-full"
          >
            <WhatsAppMark size={16} />
            {busy ? 'פותח…' : 'פתח בוואטסאפ'}
          </button>
          <button type="button" onClick={() => void handleCopy()} className="btn-ghost w-full">
            העתק טקסט
          </button>
          {status ? <p className="text-center text-xs text-cream">{status}</p> : null}
          <p className="text-center text-[11px] leading-relaxed text-muted">
            טון חם · רשימה קצרה · מחיר ליד כל מנה — בלי לחץ מכירה כבד. אפשר לשלוח גם תמונות
            המנות מצורפות.
          </p>
        </div>
      )}
    </div>
  );
}
