import Link from "next/link";
import { MedsimLogo } from "@/components/MedsimLogo";

const LEGAL_LINKS = [
  { href: "/garantie", label: "Garantie" },
  { href: "/politique-remboursement", label: "Politique de remboursement" },
  { href: "/politique-confidentialite", label: "Politique de confidentialité" },
  { href: "/conditions-utilisation", label: "Conditions d'utilisation" },
  { href: "/conformite", label: "Conformité & Loi 25" },
  { href: "/contact", label: "Contact" },
] as const;

export function Footer() {
  return (
    <footer className="bg-[var(--dark)] py-12 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="inline-block transition hover:opacity-95">
              <MedsimLogo variant="onDark" />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/75">
              Plateforme québécoise de santé métabolique : accompagnement médical, nutrition et repas
              santé encadrés par des professionnels licenciés.
            </p>
          </div>

          <nav aria-label="Informations légales" className="grid gap-2 sm:grid-cols-2 md:gap-x-10">
            <p className="col-span-full text-xs font-semibold uppercase tracking-wider text-white/50">
              Informations
            </p>
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-white/85 transition hover:text-white hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 border-t border-white/15 pt-6 text-center text-[13px] text-white/60 md:text-left">
          <p>© {new Date().getFullYear()} MedSim · Médecins certifiés · Service 100 % en ligne</p>
          <p className="mt-2">
            MedSim ne remplace pas une consultation en personne en cas d&apos;urgence. En cas d&apos;urgence
            médicale, composez le 911.
          </p>
        </div>
      </div>
    </footer>
  );
}
