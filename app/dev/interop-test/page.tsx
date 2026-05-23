import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { isDevInteropTestPageEnabled } from "@/lib/dev-interop-page";
import DevInteropTestClient from "./DevInteropTestClient";

export default async function DevInteropTestPage() {
  if (!isDevInteropTestPageEnabled()) {
    notFound();
  }
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/connexion?callbackUrl=/dev/interop-test");
  }
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DevInteropTestClient userId={session.user.id} role={session.user.role} prenom={session.user.prenom} />
    </div>
  );
}
