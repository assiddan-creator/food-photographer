export const DISH_LIBRARY_KEY = 'assi.enhancedDishes.v1';
export const DISH_LIBRARY_EVENT = 'assi-enhanced-dishes';
export const DISH_LIBRARY_MAX = 24;

export type EnhancedDish = {
  id: string;
  imageUrl: string;
  name: string;
  price: string;
  createdAt: number;
};

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `dish-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function parseDishLibrary(raw: unknown): EnhancedDish[] {
  if (!Array.isArray(raw)) return [];
  const dishes: EnhancedDish[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const record = entry as Record<string, unknown>;
    const imageUrl = asTrimmedString(record.imageUrl);
    if (!/^https?:\/\//i.test(imageUrl)) continue;
    dishes.push({
      id: asTrimmedString(record.id) || newId(),
      imageUrl,
      name: asTrimmedString(record.name),
      price: asTrimmedString(record.price),
      createdAt: typeof record.createdAt === 'number' ? record.createdAt : Date.now(),
    });
  }
  return dishes.slice(0, DISH_LIBRARY_MAX);
}

function persist(dishes: EnhancedDish[]) {
  if (typeof window === 'undefined') return;
  const next = dishes.slice(0, DISH_LIBRARY_MAX);
  const raw = JSON.stringify(next);
  window.localStorage.setItem(DISH_LIBRARY_KEY, raw);
  snapshotRaw = raw;
  snapshotCache = next;
  window.dispatchEvent(new Event(DISH_LIBRARY_EVENT));
}

export function rememberEnhancedDish(input: {
  imageUrl: string;
  name?: string;
  price?: string;
}): EnhancedDish | null {
  const imageUrl = input.imageUrl.trim();
  if (!/^https?:\/\//i.test(imageUrl)) return null;

  const existing = readDishLibrary();
  const previous = existing.find(dish => dish.imageUrl === imageUrl);
  const name = input.name?.trim();
  const price = input.price?.trim();
  if (
    previous &&
    (!name || name === previous.name) &&
    (!price || price === previous.price)
  ) {
    return previous;
  }

  const dish: EnhancedDish = {
    id: previous?.id ?? newId(),
    imageUrl,
    name: name || previous?.name || '',
    price: price || previous?.price || '',
    createdAt: previous?.createdAt ?? Date.now(),
  };
  persist([dish, ...existing.filter(item => item.imageUrl !== imageUrl)]);
  return dish;
}

export function updateEnhancedDish(
  id: string,
  patch: Partial<Pick<EnhancedDish, 'name' | 'price'>>,
): void {
  persist(
    readDishLibrary().map(dish =>
      dish.id === id
        ? {
            ...dish,
            name: patch.name !== undefined ? patch.name.trim() : dish.name,
            price: patch.price !== undefined ? patch.price.trim() : dish.price,
          }
        : dish,
    ),
  );
}

export function readDishLibrary(): EnhancedDish[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(DISH_LIBRARY_KEY);
    if (!raw) return [];
    return parseDishLibrary(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function subscribeDishLibrary(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const onStorage = (event: StorageEvent) => {
    if (event.key === DISH_LIBRARY_KEY || event.key === null) onStoreChange();
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener(DISH_LIBRARY_EVENT, onStoreChange);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(DISH_LIBRARY_EVENT, onStoreChange);
  };
}

let snapshotCache: EnhancedDish[] = [];
let snapshotRaw: string | null = null;

export function getDishLibrarySnapshot(): EnhancedDish[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(DISH_LIBRARY_KEY);
    if (raw === snapshotRaw) return snapshotCache;
    snapshotRaw = raw;
    snapshotCache = raw ? parseDishLibrary(JSON.parse(raw)) : [];
    return snapshotCache;
  } catch {
    snapshotCache = [];
    return snapshotCache;
  }
}

export function getServerDishLibrarySnapshot(): EnhancedDish[] {
  return [];
}
