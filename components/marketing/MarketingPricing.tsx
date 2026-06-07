import Link from "next/link";

const INCLUSIONS = [
  "Consultation IPS certifiée Québec",
  "Ordonnance GLP-1 personnalisée",
  "Livraison discrète à domicile",
  "Coach Anne illimitée (24h/24)",
  "Rappels hebdomadaires proactifs",
  "Rapport IPS mensuel automatique",
  "Clavardage sécurisé avec votre IPS",
  "Suivi poids + graphique progression",
  "Ordonnance PDF téléchargeable",
  "Suivi colis en temps réel",
];

export function MarketingPricing() {
  return (
    <section id="tarifs" className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-xl px-5 lg:px-8">
        <h2 className="text-center text-3xl font-black text-[#1A1A2E] sm:text-4xl">
          Un prix. Tout inclus. Aucune surprise.
        </h2>

        <div className="relative mt-12 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#1D4D3A] px-4 py-1 text-xs font-semibold text-white">
            Le plus complet
          </span>

          <p className="text-center text-6xl font-black text-[#1A1A2E]">
            149 $
            <span className="text-xl font-normal text-gray-500">/mois</span>
          </p>
          <p className="mt-2 text-center text-sm text-gray-500">+ médicament selon prescription</p>

          <ul className="mt-10 space-y-3">
            {INCLUSIONS.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-gray-600">
                <span className="font-bold text-[#10B981]">✓</span>
                {item}
              </li>
            ))}
          </ul>

          <Link
            href="/eligibilite"
            className="mt-10 flex w-full items-center justify-center rounded-full bg-[#1D4D3A] px-8 py-4 text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            Commencer maintenant →
          </Link>

          <p className="mt-6 text-center text-xs leading-relaxed text-gray-400">
            Annulable en tout temps · Sans engagement · Remboursement si non éligible
          </p>
        </div>
      </div>
    </section>
  );
}
