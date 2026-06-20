const BEFORE = [
  "1,8 million de Québécois sans médecin de famille",
  "Des mois d'attente pour une prescription",
  "Prise seul·e, sans suivi entre les rendez-vous",
  "Abandon du traitement en semaine 4 (nausées)",
  "Rechute et retour à la case départ",
];

const AFTER = [
  "IPS disponible en < 48 h, partout au Québec",
  "Prescription GLP-1 livrée chez vous",
  "Anne vous contacte chaque lundi matin",
  "Gestion proactive des effets secondaires",
  "Résultats durables avec suivi continu",
];

export function MarketingProblem() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <h2 className="text-center text-3xl font-black tracking-tight text-[#1A1A2E] sm:text-4xl md:text-5xl">
          Le système actuel ne vous suit pas.
          <br className="hidden sm:block" />
          <span className="text-[#1D4D3A]"> Anne Santé, si.</span>
        </h2>

        <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="rounded-3xl border border-red-100 bg-red-50/50 p-8 lg:p-10">
            <p className="text-sm font-bold uppercase tracking-wide text-red-700">
              Le système actuel
            </p>
            <ul className="mt-6 space-y-4">
              {BEFORE.map((item) => (
                <li key={item} className="flex gap-3 text-base text-gray-600">
                  <span className="shrink-0 text-red-500" aria-hidden>
                    ✕
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-[#1D4D3A]/20 bg-[#F0F7F4] p-8 lg:p-10">
            <p className="text-sm font-bold uppercase tracking-wide text-[#1D4D3A]">
              Avec Anne Santé
            </p>
            <ul className="mt-6 space-y-4">
              {AFTER.map((item) => (
                <li key={item} className="flex gap-3 text-base text-[#1A1A2E]">
                  <span className="shrink-0 font-bold text-[#10B981]" aria-hidden>
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
