const ITEMS = [
  {
    initials: "MD",
    bg: "bg-rose-100 text-rose-800",
    quote:
      "Le médecin était professionnel et rapide. J'ai reçu mon kit en 2 jours. Je n'aurais jamais cru perdre 13 lbs aussi facilement.",
    name: "Marie D.",
    loc: "Québec",
    result: "-13 lbs en 6 semaines",
  },
  {
    initials: "PL",
    bg: "bg-sky-100 text-sky-800",
    quote:
      "Le suivi personnalisé fait toute la différence. Je suis à 13 lbs de mon objectif. L'équipe répond à chaque question en quelques heures.",
    name: "Pierre L.",
    loc: "Montréal",
    result: "-18 lbs",
  },
  {
    initials: "SM",
    bg: "bg-emerald-100 text-emerald-800",
    quote:
      "Très facile et pratique pour une femme active. Les médecins expliquent tout clairement. Je recommande à 100%.",
    name: "Sophie M.",
    loc: "Laval",
    result: "-9 lbs",
  },
] as const;

export function Testimonials() {
  return (
    <section id="temoignages" className="scroll-mt-24 bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-[28px] font-bold tracking-tight text-[var(--gray-900)] sm:text-[32px]">
          Ils ont transformé leur vie
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {ITEMS.map(({ initials, bg, quote, name, loc, result }) => (
            <article
              key={name}
              className="rounded-[12px] border border-neutral-100 bg-[var(--gray-50)] p-6 shadow-sm transition hover:[transform:scale(1.02)]"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${bg}`}
                  aria-hidden
                >
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] text-amber-500" aria-hidden>
                    ⭐⭐⭐⭐⭐
                  </p>
                  <blockquote className="mt-3 text-[14px] leading-relaxed text-neutral-700">
                    &ldquo;{quote}&rdquo;
                  </blockquote>
                  <footer className="mt-4 text-[13px] text-neutral-600">
                    <span className="font-semibold text-[var(--gray-900)]">{name}</span>, {loc} ·{" "}
                    <span className="text-[var(--teal-600)]">{result}</span>
                  </footer>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
