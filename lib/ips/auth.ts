import { auth } from "@/auth";
import type { Role } from "@prisma/client";

const IPS_ROLES: Role[] = ["IPS", "MEDECIN", "ADMIN"];

export async function requireIpsSession() {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (!IPS_ROLES.includes(session.user.role as Role)) return null;
  return session;
}
