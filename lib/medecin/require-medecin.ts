import { getSessionUser } from "@/lib/session";
import { unauthorized, forbidden } from "@/lib/api-errors";
import type { Role } from "@prisma/client";

export async function requireMedecinApi() {
  const user = await getSessionUser();
  if (!user) return { error: unauthorized() } as const;
  if (user.role !== "MEDECIN" && user.role !== "ADMIN") {
    return { error: forbidden() } as const;
  }
  return { user, isAdmin: user.role === "ADMIN", role: user.role as Role };
}
