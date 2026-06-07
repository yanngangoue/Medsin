import { redirect } from "next/navigation";
import { IpsClavardage } from "@/components/chat/IpsClavardage";
import { requireIpsSession } from "@/lib/ips/auth";

export default async function IpsClavardagePage() {
  const session = await requireIpsSession();
  if (!session) redirect("/connexion?callbackUrl=/dashboard/ips/clavardage");

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">Clavardage patients</h1>
        <p className="mt-1 text-sm text-slate-600">
          Répondez à vos patients — filtrez par urgence.
        </p>
      </header>
      <IpsClavardage />
    </div>
  );
}
