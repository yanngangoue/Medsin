/**
 * Multi-tenancy par province (Canada) — isoler policies, consentements et routage connecteurs.
 * Les requêtes interop doivent porter un en-tête ou un segment d’URL conforme au contrat.
 */
export const PROVINCE_CODES = ["QC", "ON", "BC", "AB"] as const;
export type ProvinceCode = (typeof PROVINCE_CODES)[number];

export type TenantContext = {
  province: ProvinceCode;
  /** Identifiant organisation (CLSC, réseau, pharmacie-groupe) — phase 2 */
  organizationId?: string;
};

export function parseTenantFromHeaders(headers: Headers): TenantContext | null {
  const raw = headers.get("x-medisim-tenant") ?? headers.get("x-tenant-province");
  if (!raw) return null;
  const province = raw.trim().toUpperCase() as ProvinceCode;
  if (!PROVINCE_CODES.includes(province)) return null;
  const org = headers.get("x-medisim-org-id")?.trim() || undefined;
  return { province, organizationId: org };
}
