import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PharmacieDashboardClient } from "@/components/pharmacie/PharmacieDashboardClient";

export default async function PharmacieDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/connexion?callbackUrl=/dashboard/pharmacie");
  if (session.user.role !== "PHARMACIEN") redirect("/acces-refuse");

  return <PharmacieDashboardClient />;
}
