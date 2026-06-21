import { prisma } from "@/lib/prisma";

/** Domaine des courriels professionnels Anne-sante. */
export function staffEmailDomain(): string {
  return (process.env.MEDSIM_STAFF_EMAIL_DOMAIN ?? "anne-sante.ca").trim().toLowerCase();
}

function slugPart(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
}

/** Propose un courriel @anne-sante.ca à partir du prénom et du nom. */
export function proposeStaffEmail(prenom: string, nom: string): string {
  const domain = staffEmailDomain();
  const local = [slugPart(prenom), slugPart(nom)].filter(Boolean).join(".");
  return `${local || "membre"}@${domain}`;
}

/** Retourne un courriel @anne-sante.ca unique (suffixe numérique si collision). */
export async function ensureUniqueStaffEmail(
  prenom: string,
  nom: string,
  override?: string,
): Promise<string> {
  const base = (override?.trim().toLowerCase() || proposeStaffEmail(prenom, nom)).replace(/\s+/g, "");
  const domain = staffEmailDomain();

  if (!base.includes("@")) {
    return ensureUniqueLocalEmail(`${base}@${domain}`);
  }

  const [local, emailDomain] = base.split("@");
  if (emailDomain !== domain) {
    return ensureUniqueLocalEmail(`${local}@${domain}`);
  }

  return ensureUniqueLocalEmail(base);
}

async function ensureUniqueLocalEmail(email: string): Promise<string> {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;

  let candidate = email;
  let n = 2;
  while (await prisma.user.findFirst({ where: { email: candidate } })) {
    candidate = `${local}.${n}@${domain}`;
    n += 1;
  }
  return candidate;
}
