'use client';

import { useCallback, useSyncExternalStore } from 'react';
import {
  getDishLibrarySnapshot,
  getServerDishLibrarySnapshot,
  rememberEnhancedDish,
  subscribeDishLibrary,
  updateEnhancedDish,
  type EnhancedDish,
} from '@/lib/dish-library';

export function useDishLibrary() {
  const dishes = useSyncExternalStore(
    subscribeDishLibrary,
    getDishLibrarySnapshot,
    getServerDishLibrarySnapshot,
  );

  const remember = useCallback(
    (input: { imageUrl: string; name?: string; price?: string }) => rememberEnhancedDish(input),
    [],
  );

  const updateDish = useCallback(
    (id: string, patch: Partial<Pick<EnhancedDish, 'name' | 'price'>>) => {
      updateEnhancedDish(id, patch);
    },
    [],
  );

  return { dishes, remember, updateDish };
}
