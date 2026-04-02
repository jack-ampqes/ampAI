const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 120;
const buckets = new Map();
export function rateLimit(key) {
    const now = Date.now();
    const b = buckets.get(key);
    if (!b || now > b.reset) {
        buckets.set(key, { count: 1, reset: now + WINDOW_MS });
        return true;
    }
    if (b.count >= MAX_PER_WINDOW)
        return false;
    b.count += 1;
    return true;
}
