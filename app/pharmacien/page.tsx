import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/role-portal/SignOutButton";
import { isPublicSiteMode } from "@/lib/is-public-site";

export default async function PharmacienDashboardPage() {
  const session = await auth();
  if (!isPublicSiteMode()) {
    if (!session?.user) redirect("/auth/connexion?callbackUrl=/pharmacien");
    if (session.user.role !== "PHARMACIEN") redirect("/acces-refuse");
  }

  const prenom = session?.user?.prenom ?? session?.user?.name ?? "Sophie";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="border-b border-slate-200/80 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-slate-900">
            Medsim
          </Link>
          <span className="text-xs font-medium text-slate-500">Espace pharmacien</span>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Bonjour, {prenom}</h1>
        <p className="text-sm text-slate-600">
          Tableau de bord pharmacien (MVP) — ordonnances et files d’attente à brancher ici.
        </p>
      </main>
    </div>
  );
}
