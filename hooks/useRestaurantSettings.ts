'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import {
  EMPTY_SETTINGS,
  getServerSettingsSnapshot,
  getSettingsSnapshot,
  parseSettings,
  resolveGoogleReviewUrl,
  resolveWhatsApp,
  subscribeSettings,
  writeStoredSettings,
  type RestaurantSettings,
} from '@/lib/restaurant-settings';

export function useRestaurantSettings() {
  const stored = useSyncExternalStore(
    subscribeSettings,
    getSettingsSnapshot,
    getServerSettingsSnapshot,
  );

  const save = useCallback((next: RestaurantSettings) => {
    writeStoredSettings(parseSettings(next));
  }, []);

  const resolved = useMemo(
    () => ({
      name: stored.name,
      whatsapp: resolveWhatsApp(stored),
      googleReviewUrl: resolveGoogleReviewUrl(stored),
      nextVisitText: stored.nextVisitText,
    }),
    [stored],
  );

  return { stored, resolved, save, empty: EMPTY_SETTINGS };
}
