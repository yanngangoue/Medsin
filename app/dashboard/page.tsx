import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { defaultHomeForRole } from "@/lib/rbac";

/** Ancienne URL : redirection vers l’espace selon le rôle (RBAC). */
export default async function DashboardLegacyRedirectPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/connexion?callbackUrl=/dashboard");
  }
  redirect(defaultHomeForRole(session.user.role));
}
