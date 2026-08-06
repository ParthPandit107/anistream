type CacheEntry<T> = {
  data: T;
  expiry: number;
};

class SimpleCache {
  private store: Map<string, CacheEntry<any>> = new Map();

  get<T>(key: string): T | null {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }

    return item.data as T;
  }

  set<T>(key: string, data: T, ttlSeconds: number = 3600): void {
    const expiry = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { data, expiry });
  }

  clear(): void {
    this.store.clear();
  }
}

export const apiCache = new SimpleCache();

export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise((res) => setTimeout(res, delayMs));
    return fetchWithRetry(fn, retries - 1, delayMs * 2);
  }
}
