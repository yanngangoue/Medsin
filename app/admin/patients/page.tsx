import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isStaffRole } from "@/lib/session";
import { AdminPatientsTable } from "@/components/admin/AdminPatientsTable";
import { PreviousPageButton } from "@/components/navigation/PreviousPageButton";

type Props = {
  searchParams: Promise<{ queue?: string; status?: string; glp1?: string }>;
};

export default async function AdminPatientsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/connexion?callbackUrl=/admin/patients");
  if (!isStaffRole(session.user.role)) redirect("/acces-refuse");

  const { queue } = await searchParams;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#16a34a]">
              Télésanté métabolique
            </p>
            <h1 className="text-xl font-semibold text-slate-900">Patients</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <PreviousPageButton
              fallbackHref="/admin/dashboard"
              className="text-sm text-[#16a34a] hover:underline"
            />
            <Link href="/admin/dashboard" className="text-sm text-slate-600 hover:underline">
              Tableau de bord
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        <Suspense fallback={<p className="text-slate-500">Chargement…</p>}>
          <AdminPatientsTable initialQueue={queue} />
        </Suspense>
      </main>
    </div>
  );
}
