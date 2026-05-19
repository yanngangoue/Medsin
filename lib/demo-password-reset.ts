import { randomBytes } from "node:crypto";
import { hashPasswordResetToken } from "@/lib/password-reset-token";

const byHash = new Map<string, { userId: string; expiresAt: number }>();
const latestHashByUserId = new Map<string, string>();

export { hashPasswordResetToken } from "@/lib/password-reset-token";

/** Invalide les anciens jetons et en crée un nouveau ; retourne le jeton brut (à mettre dans l’URL). */
export function demoCreatePasswordResetToken(userId: string): string {
  const prev = latestHashByUserId.get(userId);
  if (prev) byHash.delete(prev);

  const raw = randomBytes(32).toString("hex");
  const tokenHash = hashPasswordResetToken(raw);
  const expiresAt = Date.now() + 60 * 60 * 1000;
  byHash.set(tokenHash, { userId, expiresAt });
  latestHashByUserId.set(userId, tokenHash);
  return raw;
}

/** Consomme le jeton (usage unique) et retourne le userId si valide. */
export function demoConsumePasswordResetToken(rawToken: string): string | null {
  const tokenHash = hashPasswordResetToken(rawToken);
  const row = byHash.get(tokenHash);
  if (!row || row.expiresAt < Date.now()) {
    if (row) byHash.delete(tokenHash);
    return null;
  }
  byHash.delete(tokenHash);
  if (latestHashByUserId.get(row.userId) === tokenHash) {
    latestHashByUserId.delete(row.userId);
  }
  return row.userId;
}
