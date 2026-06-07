import Link from "next/link";
import { redirect } from "next/navigation";
import { IpsClavardage } from "@/components/chat/IpsClavardage";
import { requireIpsSession } from "@/lib/ips/auth";

export default async function IpsClavardagePage() {
  const session = await requireIpsSession();
  if (!session) redirect("/connexion?callbackUrl=/dashboard/ips/clavardage");

  return (
    <div>
      <Link href="/dashboard/ips" className="text-sm font-medium text-[#1D4D3A] hover:underline">
        ← Retour aux dossiers
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-[#1A1A2E]">Clavardage patients</h1>
      <p className="mt-1 text-sm text-[#6B7280]">Répondez à vos patients — filtrez par urgence.</p>
      <div className="mt-6">
        <IpsClavardage />
      </div>
    </div>
  );
}
