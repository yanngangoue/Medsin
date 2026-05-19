import Link from "next/link";
import { MedsimLogo } from "@/components/MedsimLogo";

export default function AccesRefusePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="mx-auto w-full max-w-md text-center">
        <Link href="/" className="mb-8 inline-flex justify-center">
          <MedsimLogo />
        </Link>
        <h1 className="text-xl font-semibold text-slate-900">Accès refusé</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Vous n’avez pas les droits nécessaires pour consulter cette section. Si vous pensez qu’il s’agit d’une erreur,
          contactez le support Medsim.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/connexion"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Connexion
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#1D9E75] px-5 text-sm font-medium text-white hover:opacity-95"
          >
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
