import { auth } from "@/auth";
import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm";

export default async function AdminSettingsPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
      <p className="mt-1 text-sm text-slate-600">Compte back-office Anne Santé</p>
      <div className="mt-6">
        <AdminSettingsForm
          prenom={user?.prenom ?? user?.name ?? ""}
          email={user?.email ?? ""}
        />
      </div>
    </div>
  );
}
