import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isStaffRole } from "@/lib/session";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { PortalSectionBoundary } from "@/components/layout/PortalSectionBoundary";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/connexion?callbackUrl=/admin/dashboard");
  if (!isStaffRole(session.user.role)) redirect("/acces-refuse");

  const prenom = session.user.prenom ?? session.user.name ?? "Équipe";

  return (
    <div className="min-h-screen bg-white md:flex">
      <AdminSidebar />
      <div className="flex min-h-screen flex-1 flex-col pb-[max(5rem,calc(4rem+env(safe-area-inset-bottom)))] md:pb-0">
        <AdminHeader prenom={prenom} role={session.user.role} />
        <main className="flex-1 bg-[#F8FAFC]">
          <PortalSectionBoundary title="Impossible d'afficher cette section de l'administration.">
            {children}
          </PortalSectionBoundary>
        </main>
      </div>
    </div>
  );
}
