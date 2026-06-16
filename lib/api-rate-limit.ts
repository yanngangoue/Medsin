/** Rate limiting générique pour les endpoints API (in-memory, MVP). */

const WINDOW_MS = 15 * 60 * 1000;

type Bucket = { count: number; resetAt: number };
const stores = new Map<string, Map<string, Bucket>>();

function getStore(namespace: string): Map<string, Bucket> {
  let store = stores.get(namespace);
  if (!store) {
    store = new Map();
    stores.set(namespace, store);
  }
  return store;
}

function prune(store: Map<string, Bucket>, now: number) {
  for (const [key, b] of store) {
    if (now > b.resetAt) store.delete(key);
  }
}

export function checkApiRateLimit(
  namespace: string,
  key: string,
  max: number,
): boolean {
  const store = getStore(namespace);
  const now = Date.now();
  prune(store, now);
  const existing = store.get(key);
  if (!existing || now > existing.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (existing.count >= max) return false;
  existing.count += 1;
  return true;
}

export function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() ?? "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}
