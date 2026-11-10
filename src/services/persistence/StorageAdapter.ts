/**
 * ORCHESTRA Persistence Abstraction Layer
 * Provides a clean, decoupled data storage interface.
 * Implements a resilient local storage adapter with in-memory fallback,
 * allowing future stages to plug in CloudSQL, Firestore, or PostgreSQL without modifying business logic.
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

  constructor(storageKey: string, initialData?: T[]) {
    this.key = `orchestra_${storageKey}`;
    this.isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

    // Hydrate from localStorage or initialize with seed data
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
  }

  private persist(): void {
    if (!this.isBrowser) return;
    try {
      const items = Array.from(this.memoryCache.values());
      window.localStorage.setItem(this.key, JSON.stringify(items));
    } catch (e) {
      console.warn(`[StorageAdapter] Failed to write to localStorage for key ${this.key}`, e);
    }
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
