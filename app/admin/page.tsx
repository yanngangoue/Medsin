import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MedsimLogo } from "@/components/MedsimLogo";
import { SignOutButton } from "@/components/role-portal/SignOutButton";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/acces-refuse");

  const prenom = session.user.prenom ?? session.user.name ?? "—";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="border-b border-slate-200/80 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" aria-label="MedSim">
            <MedsimLogo />
          </Link>
          <span className="text-xs font-medium text-slate-500">Administration</span>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Console admin</h1>
        <p className="text-sm text-slate-600">Bonjour {prenom}. Outils d’audit et de configuration (MVP) à étendre ici.</p>
      </main>
    </div>
  );
}
