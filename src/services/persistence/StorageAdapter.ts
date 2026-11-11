/**
 * ORCHESTRA Persistence Abstraction Layer
 * Provides a resilient, decoupled data storage interface.
 * Implements a hybrid persistence adapter that provides synchronous in-memory and localStorage
 * caching paired with asynchronous server-authoritative disk sync (/api/persistence/*).
 */

export interface IPersistenceStorage<T extends { id: string }> {
  get(id: string): T | null;
  getAll(): T[];
  set(id: string, item: T): void;
  setAll(items: T[]): void;
  delete(id: string): boolean;
  query(predicate: (item: T) => boolean): T[];
  clear(): void;
}

export class LocalStoragePersistenceAdapter<T extends { id: string }> implements IPersistenceStorage<T> {
  private key: string;
  private memoryCache: Map<string, T> = new Map();
  private isBrowser: boolean;
  private syncTimeout: any = null;

  constructor(storageKey: string, initialData?: T[]) {
    this.key = `orchestra_${storageKey}`;
    this.isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

    // 1. Hydrate from localStorage or initialize with seed data
    if (this.isBrowser) {
      try {
        const raw = window.localStorage.getItem(this.key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach((item: T) => this.memoryCache.set(item.id, item));
          }
        }
      } catch (e) {
        console.warn(`[StorageAdapter] Failed to hydrate ${this.key} from localStorage, using memory`, e);
      }
    }

    // Seed if empty
    if (this.memoryCache.size === 0 && initialData && initialData.length > 0) {
      initialData.forEach((item) => this.memoryCache.set(item.id, item));
      this.persist();
    }

    // 2. Asynchronously sync with server disk persistence
    if (this.isBrowser) {
      this.syncWithServer(storageKey);
    }
  }

  private async syncWithServer(collection: string) {
    try {
      const res = await fetch(`/api/persistence/${collection}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items) && data.items.length > 0) {
          data.items.forEach((item: T) => {
            if (item && item.id && !this.memoryCache.has(item.id)) {
              this.memoryCache.set(item.id, item);
            }
          });
          // Update localStorage
          const all = Array.from(this.memoryCache.values());
          window.localStorage.setItem(this.key, JSON.stringify(all));
        }
      }
    } catch {
      // Offline or network unreachable - rely on localStorage
    }
  }

  private persist(): void {
    if (!this.isBrowser) return;

    const items = Array.from(this.memoryCache.values());

    // Write to client localStorage
    try {
      window.localStorage.setItem(this.key, JSON.stringify(items));
    } catch (e) {
      console.warn(`[StorageAdapter] Failed to write to localStorage for key ${this.key}`, e);
    }

    // Debounced sync to server disk persistence
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }

    this.syncTimeout = setTimeout(async () => {
      try {
        const rawCollection = this.key.replace(/^orchestra_/, '');
        await fetch(`/api/persistence/${rawCollection}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items })
        });
      } catch {
        // Silent server sync failover
      }
    }, 400);
  }

  public get(id: string): T | null {
    return this.memoryCache.get(id) || null;
  }

  public getAll(): T[] {
    return Array.from(this.memoryCache.values());
  }

  public set(id: string, item: T): void {
    this.memoryCache.set(id, item);
    this.persist();
  }

  public setAll(items: T[]): void {
    this.memoryCache.clear();
    items.forEach((item) => this.memoryCache.set(item.id, item));
    this.persist();
  }

  public delete(id: string): boolean {
    const deleted = this.memoryCache.delete(id);
    if (deleted) this.persist();
    return deleted;
  }

  public query(predicate: (item: T) => boolean): T[] {
    return Array.from(this.memoryCache.values()).filter(predicate);
  }

  public clear(): void {
    this.memoryCache.clear();
    this.persist();
  }
}
