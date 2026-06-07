import Link from "next/link";

const MEDS = [
  {
    name: "Ozempic®",
    badge: "Populaire",
    badgeClass: "bg-gray-100 text-gray-700",
    molecule: "Sémaglutide 0,25 mg → 1 mg",
    frequency: "Injection hebdomadaire",
    price: "199 $",
    perks: ["Approuvé Santé Canada", "Couverture assurance partielle possible"],
  },
  {
    name: "Wegovy®",
    badge: "Perte de poids",
    badgeClass: "bg-[#F0F7F4] text-[#1D4D3A]",
    molecule: "Sémaglutide 0,25 mg → 2,4 mg",
    frequency: "Injection hebdomadaire",
    price: "299 $",
    perks: ["Spécifiquement approuvé pour l'obésité"],
  },
  {
    name: "Apo-Semaglutide",
    badge: "Nouveau · Meilleur prix",
    badgeClass: "bg-[#1D4D3A] text-white",
    molecule: "Sémaglutide générique",
    frequency: "Injection hebdomadaire",
    price: "99 $",
    perks: ["Approuvé Santé Canada mai 2026", "Même molécule, prix réduit"],
  },
];

export function MarketingMedications() {
  return (
    <section id="medicaments" className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <h2 className="text-4xl font-black tracking-tight text-[#1A1A2E] md:text-5xl">
          Médicaments GLP-1 disponibles
        </h2>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {MEDS.map((med) => (
            <article
              key={med.name}
              className="flex flex-col rounded-2xl border border-gray-200 p-6 shadow-sm"
            >
              <span
                className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${med.badgeClass}`}
              >
                {med.badge}
              </span>
              <h3 className="mt-4 text-2xl font-bold text-[#1A1A2E]">{med.name}</h3>
              <p className="mt-2 text-sm text-gray-500">{med.molecule}</p>
              <p className="mt-1 text-sm text-gray-500">{med.frequency}</p>
              <p className="mt-6 text-3xl font-black text-[#1D4D3A]">
                {med.price}
                <span className="text-base font-normal text-gray-500">/mois</span>
              </p>
              <p className="text-xs text-gray-400">à partir de</p>
              <ul className="mt-6 flex-1 space-y-2">
                {med.perks.map((p) => (
                  <li key={p} className="flex gap-2 text-sm text-gray-600">
                    <span className="text-[#10B981]">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
              <Link
                href="/eligibilite"
                className="mt-8 inline-flex justify-center rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-[#1A1A2E] transition-colors hover:border-[#1D4D3A]"
              >
                Vérifier mon éligibilité
              </Link>
            </article>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-gray-500">
          Tous les médicaments sont prescrits par une IPS certifiée après évaluation médicale.
        </p>
      </div>
    </section>
  );
}
