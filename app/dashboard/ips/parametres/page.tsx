import { redirect } from "next/navigation";
import { requireIpsSession } from "@/lib/ips/auth";

export default async function IpsParametresPage() {
  const session = await requireIpsSession();
  if (!session) redirect("/connexion?callbackUrl=/dashboard/ips/parametres");

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <header>
        <h1 className="text-2xl font-black text-slate-900">Paramètres</h1>
        <p className="mt-1 text-sm text-slate-600">Profil professionnel et préférences IPS.</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">Nom</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {session.user.name ?? session.user.prenom}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">Courriel</dt>
            <dd className="mt-1 text-slate-800">{session.user.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">Rôle</dt>
            <dd className="mt-1 text-slate-800">{session.user.role}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
