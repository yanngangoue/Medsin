import Link from "next/link";
import { MarketingReveal } from "@/components/marketing/MarketingReveal";

const ITEMS = [
  "Ordonnance GLP-1 rapide et efficace",
  "Accompagnement 1:1 par une IPS certifiée",
  "Coach Anne illimité — incluse",
  "Clavardage sécurisé 24 h/24",
  "Livraison discrète à domicile",
  "Suivi poids et rapports automatiques",
] as const;

export function MarketingIncluded() {
  return (
    <section className="bg-[#FAFAF8] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="label-caps text-[#1D4D3A]">Soins GLP-1 guidés par médecin</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#1A1A2E] sm:text-4xl lg:text-5xl">
              La perte de poids, simplifiée avec un suivi personnalisé
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-gray-500 sm:text-lg">
              Trouvez le bon médicament GLP-1 en toute confiance — évaluation IPS, prix transparent et
              parcours 100 % en ligne.
            </p>
            <Link
              href="/eligibilite"
              className="mt-8 inline-flex rounded-full bg-[#1D4D3A] px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              Commencer →
            </Link>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-lg shadow-[#1D4D3A]/5 transition-shadow hover:shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Tout est inclus
            </h3>
            <ul className="mt-6 space-y-4">
              {ITEMS.map((item, i) => (
                <li
                  key={item}
                  className="marketing-check-item flex gap-3 text-[15px] text-gray-700"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1D4D3A]/10 text-xs font-bold text-[#1D4D3A]"
                    aria-hidden
                  >
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
