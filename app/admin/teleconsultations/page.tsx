import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isStaffRole } from "@/lib/session";
import { AdminTeleconsultSchedule } from "@/components/admin/AdminTeleconsultSchedule";

export default async function AdminTeleconsultationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/connexion?callbackUrl=/admin/teleconsultations");
  if (!isStaffRole(session.user.role)) redirect("/acces-refuse");

  const upcomingCount = await prisma.appointment.count({
    where: {
      status: "SCHEDULED",
      scheduledAt: { gte: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    },
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#16a34a]">
              Télésanté
            </p>
            <h1 className="text-xl font-semibold text-slate-900">Consultations vidéo</h1>
          </div>
          <Link href="/admin/dashboard" className="text-sm text-[#16a34a] hover:underline">
            ← Tableau de bord
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
        <p className="mb-6 text-sm text-slate-600">
          {upcomingCount} rendez-vous à venir. Rejoignez la salle 15 minutes avant l&apos;heure
          prévue — le patient utilise le même lien depuis son espace.
        </p>
        <AdminTeleconsultSchedule />
      </main>
    </div>
  );
}
