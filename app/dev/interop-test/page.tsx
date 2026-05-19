import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { isDevInteropTestPageEnabled } from "@/lib/dev-interop-page";
import { isPublicSiteMode } from "@/lib/is-public-site";
import type { Role } from "@prisma/client";
import DevInteropTestClient from "./DevInteropTestClient";

export default async function DevInteropTestPage() {
  if (!isDevInteropTestPageEnabled()) {
    notFound();
  }
  const session = await auth();
  if (!session?.user?.id && !isPublicSiteMode()) {
    redirect("/connexion?callbackUrl=/dev/interop-test");
  }
  const userId = session?.user?.id ?? "demo_public_patient";
  const role = (session?.user?.role ?? "PATIENT") as Role;
  const prenom = session?.user?.prenom ?? "Démo";
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DevInteropTestClient userId={userId} role={role} prenom={prenom} />
    </div>
  );
}
