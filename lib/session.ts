import { auth } from "@/auth";
import type { Role } from "@prisma/client";

export type SessionUser = {
  id: string;
  email?: string | null;
  prenom: string;
  role: Role;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) return null;
  return {
    id: session.user.id,
    email: session.user.email,
    prenom: session.user.prenom ?? session.user.name ?? "",
    role: session.user.role,
  };
}

export function isStaffRole(role: Role): boolean {
  return role === "MEDECIN" || role === "ADMIN";
}
