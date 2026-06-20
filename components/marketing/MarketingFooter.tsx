import Link from "next/link";
import { MarketingLogo } from "@/components/marketing/MarketingLogo";

export function MarketingFooter() {
  return (
    <footer className="bg-[#0F0F0F] text-white/60">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:grid-cols-2 md:grid-cols-4 lg:px-8">
        <div>
          <MarketingLogo variant="dark" />
          <p className="mt-4 text-sm leading-relaxed">
            Plateforme médicale québécoise — GLP-1 + coach IA Anne.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Produit</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link href="/eligibilite" className="hover:text-white">
                Éligibilité
              </Link>
            </li>
            <li>
              <Link href="#anne" className="hover:text-white">
                Anne — coach IA
              </Link>
            </li>
            <li>
              <Link href="#tarifs" className="hover:text-white">
                Tarifs
              </Link>
            </li>
            <li>
              <Link href="/auth/inscription" className="hover:text-white">
                Créer un compte
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Légal</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link href="/confidentialite" className="hover:text-white">
                Loi 25
              </Link>
            </li>
            <li>
              <Link href="/confidentialite" className="hover:text-white">
                Confidentialité
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white">
                CGU
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Contact</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href="mailto:support@medsim.ca" className="hover:text-white">
                support@medsim.ca
              </a>
            </li>
            <li>
              <a href="tel:811" className="hover:text-white">
                Urgence : 811
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-5 py-8 lg:px-8">
        <p className="mx-auto max-w-7xl text-center text-xs leading-relaxed">
          Anne Santé ne remplace pas un médecin. Tous les traitements sont prescrits par des IPS
          certifiées au Québec. Anne est une IA — elle ne pose pas de diagnostic médical.
        </p>
        <p className="mx-auto mt-4 max-w-7xl text-center text-xs text-white/40">
          © 2026 Anne Santé Inc. · Plateforme médicale québécoise · Loi 25 · Confidentialité · CGU ·
          Contact
        </p>
      </div>
    </footer>
  );
}
