function CheckIcon({ className }: { className?: string }) {
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--teal)] text-white shadow-sm ${className ?? ""}`}
      aria-hidden
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

const POINTS = [
  "Médecins et pharmaciens licenciés au Canada",
  "Suivi médical et assistant IA proactif (Claude)",
  "IA d’analyse et de personnalisation métabolique",
  "Conformité Loi\u202f25 et sécurité des données patients",
] as const;

export function WhyMedsimSection() {
  return (
    <section
      className="border-y border-[var(--border-soft)] bg-[#f8fafb] py-14 sm:py-20"
      aria-labelledby="why-medsim-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="why-medsim-heading" className="text-[26px] font-bold tracking-tight text-[var(--gray-900)] sm:text-[32px]">
            {`Pourquoi choisir Anne Santé\u202f?`}
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--gray-muted)] sm:text-[16px]">
            La première plateforme canadienne de santé métabolique intégrée, soutenue par l’IA et supervisée par des
            professionnels.
          </p>
        </div>

        <ul className="mx-auto mt-12 max-w-3xl space-y-5">
          {POINTS.map((line) => (
            <li
              key={line}
              className="flex items-start gap-4 rounded-[14px] border border-[var(--border-soft)] bg-white p-4 shadow-sm sm:p-5"
            >
              <CheckIcon />
              <span className="pt-1.5 text-[15px] font-medium leading-snug text-[var(--gray-900)] sm:text-[16px]">
                {line}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
