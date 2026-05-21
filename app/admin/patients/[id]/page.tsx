import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isStaffRole } from "@/lib/session";
import { AdminPatientDetail } from "@/components/admin/AdminPatientDetail";

type Props = { params: Promise<{ id: string }> };

export default async function AdminPatientDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/connexion");
  if (!isStaffRole(session.user.role)) redirect("/acces-refuse");

  const { id } = await params;

  return (
    <AdminPatientDetail
      patientId={id}
      staffUserId={session.user.id}
      staffPrenom={session.user.prenom ?? session.user.name ?? "Équipe"}
    />
  );
}
