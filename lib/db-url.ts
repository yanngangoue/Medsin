/**
 * URL Prisma côté serveur. Avec Supabase, le pooler transactionnel (6543) peut échouer
 * en auth ; on privilégie DIRECT_URL (session / direct 5432) pour les requêtes app.
 */
export function getPrismaDatabaseUrl(): string {
  const direct = process.env.DIRECT_URL?.trim();
  const pooled = process.env.DATABASE_URL?.trim();
  const url = direct || pooled;
  if (!url) {
    throw new Error("DATABASE_URL ou DIRECT_URL manquant dans .env");
  }
  return url;
}
