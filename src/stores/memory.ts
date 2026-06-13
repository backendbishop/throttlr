import type { Store } from '../types.js';

// In-process store using a Map.
// Sufficient for single-instance deployments and demos.
// For distributed deployments, replace with a Redis store
// implementing the same Store interface — no limiter changes required.
export class MemoryStore implements Store {
  private data: Map<string, number[]> = new Map();

  async get(key: string): Promise<number[]> {
    return this.data.get(key) ?? [];
  }

  async set(key: string, values: number[]): Promise<void> {
    this.data.set(key, values);
  }
}
