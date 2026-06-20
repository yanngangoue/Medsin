import { signOut } from "next-auth/react";

/** Déconnexion NextAuth + suppression du cookie JWT legacy éventuel. */
export async function signOutMedsim(callbackUrl = "/"): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // Nettoyage best-effort — la session NextAuth reste prioritaire.
  }
  await signOut({ callbackUrl });
}
