import Link from "next/link";
import { MarketingLogo } from "@/components/marketing/MarketingLogo";

const FOOTER_LINKS = [
  { href: "/confidentialite", label: "Politique de confidentialité" },
  { href: "/conditions-utilisation", label: "Conditions d'utilisation" },
  { href: "/contact", label: "Contact" },
] as const;

export function MarketingFooter() {
  return (
    <footer className="border-t border-gray-100 bg-[#FAFAF8] py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <MarketingLogo />
            <p className="mt-3 max-w-xs text-sm text-[#1A1A2E]/65">
              Perte de poids GLP-1 avec Anne, coach santé IA proactive — pour le Québec et le Canada.
            </p>
          </div>
          <nav className="flex flex-col gap-2 sm:flex-row sm:gap-6" aria-label="Liens du pied de page">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[#1A1A2E]/70 transition hover:text-[#1D4D3A]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="mt-10 text-center text-xs text-[#1A1A2E]/50 md:text-left">
          © 2026 MedSim Inc. · Plateforme médicale québécoise
        </p>
        <p className="mt-3 text-center text-[11px] leading-relaxed text-[#1A1A2E]/45 md:text-left">
          MedSim ne remplace pas un médecin. Tous les traitements sont prescrits par des
          professionnels de santé certifiés.
        </p>
      </div>
    </footer>
  );
}
