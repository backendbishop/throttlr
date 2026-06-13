import type { Request } from 'express';
export type LimiterFn = (timestamps: number[], now: number, max: number, windowMs: number) => LimiterResult;
export type LimiterResult = {
    allowed: boolean;
    timestamps: number[];
    remaining: number;
    resetAt: number;
};
export interface Store {
    get(key: string): Promise<number[]>;
    set(key: string, values: number[]): Promise<void>;
}
export type KeyGen = (req: Request) => string;
export type RateLimitOptions = {
    max: number;
    windowMs: number;
    keyGen?: KeyGen;
    store?: Store;
};
//# sourceMappingURL=types.d.ts.map