// In-process store using a Map.
// Sufficient for single-instance deployments and demos.
// For distributed deployments, replace with a Redis store
// implementing the same Store interface — no limiter changes required.
export class MemoryStore {
    constructor() {
        this.data = new Map();
    }
    async get(key) {
        return this.data.get(key) ?? [];
    }
    async set(key, values) {
        this.data.set(key, values);
    }
}
//# sourceMappingURL=memory.js.map