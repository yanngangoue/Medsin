import { auth } from "@/auth";
import type { Role } from "@prisma/client";

const NUTRITIONNISTE_ROLES: Role[] = ["NUTRITIONNISTE", "ADMIN"];

export async function requireNutritionnnisteSession() {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (!NUTRITIONNISTE_ROLES.includes(session.user.role as Role)) return null;
  return session;
}
