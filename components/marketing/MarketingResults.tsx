const STATS = [
  { value: "-14,1 kg", label: "En moyenne après 1 an (PubMed 2025)" },
  { value: "< 48 h", label: "Pour recevoir votre ordonnance" },
  { value: "24/7", label: "Anne disponible, sans exception" },
];

const PROGRESS = [
  { week: "Semaine 4", kg: "-2 kg", pct: 14 },
  { week: "Semaine 12", kg: "-5 kg", pct: 36 },
  { week: "Semaine 26", kg: "-9 kg", pct: 64 },
  { week: "Semaine 52", kg: "-14 kg", pct: 100 },
];

export function MarketingResults() {
  return (
    <section className="bg-[#1D4D3A] py-24 text-white lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-12 md:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.value}>
              <p className="text-5xl font-black tracking-tight md:text-6xl lg:text-7xl">{s.value}</p>
              <p className="mt-3 text-base text-white/70">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 rounded-3xl border border-white/10 bg-white/5 p-8 lg:p-10">
          <p className="text-lg font-semibold">Perte de poids moyenne avec semaglutide</p>
          <div className="mt-8 space-y-5">
            {PROGRESS.map((row) => (
              <div key={row.week}>
                <div className="mb-2 flex justify-between text-sm text-white/80">
                  <span>{row.week}</span>
                  <span className="font-semibold text-white">{row.kg}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="marketing-progress-bar h-full rounded-full bg-[#3EBD93]"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
