import Link from "next/link";

export default function IpsDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#3EBD93]">MedSim IPS</p>
            <Link href="/dashboard/ips" className="text-lg font-bold text-[#1A1A2E]">
              Dossiers patients
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/ips/clavardage" className="text-sm font-medium text-[#1D4D3A]">
              Clavardage
            </Link>
            <Link href="/connexion" className="text-sm text-[#6B7280] hover:text-[#1D4D3A]">
              Déconnexion
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
