import type { Store } from '../types.js';
export declare class MemoryStore implements Store {
    private data;
    get(key: string): Promise<number[]>;
    set(key: string, values: number[]): Promise<void>;
}
//# sourceMappingURL=memory.d.ts.map