import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { defaultHomeForRole } from "@/lib/rbac";
import { isPublicSiteMode } from "@/lib/is-public-site";

/** Ancienne URL : redirection vers l’espace selon le rôle (RBAC). */
export default async function DashboardLegacyRedirectPage() {
  const session = await auth();
  if (!session?.user) {
    redirect(isPublicSiteMode() ? "/" : "/connexion?callbackUrl=/dashboard");
  }
  redirect(defaultHomeForRole(session.user.role));
}
