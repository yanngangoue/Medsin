const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 20;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function prune(now: number) {
  for (const [key, b] of buckets) {
    if (now > b.resetAt) buckets.delete(key);
  }
}

/** Retourne false si la limite est dépassée (anti brute-force MVP, mémoire process). */
export function checkLoginRateLimit(key: string): boolean {
  const now = Date.now();
  prune(now);
  const existing = buckets.get(key);
  if (!existing || now > existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (existing.count >= MAX_ATTEMPTS) return false;
  existing.count += 1;
  return true;
}

/** Après inscription réussie : évite que des essais de connexion ratés bloquent le 1er `signIn` immédiat. */
export function resetLoginRateLimitForKey(key: string): void {
  buckets.delete(key);
}
