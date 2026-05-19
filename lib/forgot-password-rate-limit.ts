const WINDOW_MS = 60 * 60 * 1000;
const MAX_ATTEMPTS = 10;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function prune(now: number) {
  for (const [key, b] of buckets) {
    if (now > b.resetAt) buckets.delete(key);
  }
}

/** Limite les demandes de réinitialisation par IP (MVP, mémoire process). */
export function checkForgotPasswordRateLimit(key: string): boolean {
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
