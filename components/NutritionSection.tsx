import Link from "next/link";

function IconMealPlan({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconSupplements({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8 10h8v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 10V8a2 2 0 0 1 4 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 6v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconDelivery({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 18V8h5l3 4v6h-3M2 18h12M2 8v10M14 8V6a2 2 0 0 1 2-2h2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="18" r="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

const CARDS = [
  {
    title: "Plans alimentaires personnalisés",
    body: "Structuration des repas selon votre profil métabolique, vos préférences et les repères de votre équipe soignante.",
    Icon: IconMealPlan,
  },
  {
    title: "Compléments santé validés",
    body: "Propositions documentées, cohérentes avec votre traitement et soumises à validation clinique avant toute recommandation.",
    Icon: IconSupplements,
  },
  {
    title: "Livraison de repas équilibrés (bientôt disponible)",
    body: "Service en préparation : portions contrôlées et traçabilité nutritionnelle, intégrées au même fil de suivi que votre dossier.",
    Icon: IconDelivery,
  },
] as const;

export function NutritionSection() {
  return (
    <section
      className="border-t border-[var(--border-soft)] bg-[var(--teal-light)]/70 py-14 sm:py-20"
      aria-labelledby="nutrition-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="nutrition-heading" className="text-[26px] font-bold tracking-tight text-[var(--gray-900)] sm:text-[32px]">
            Une nutrition adaptée à votre parcours métabolique
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--gray-muted)] sm:text-[16px]">
            Nos nutritionnistes et notre IA conçoivent des plans de repas et des compléments alignés avec votre métabolisme,
            vos objectifs et votre traitement GLP-1.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {CARDS.map(({ title, body, Icon }) => (
            <article
              key={title}
              className="flex flex-col rounded-[14px] border border-[var(--border-soft)] bg-white p-5 shadow-sm transition hover:[transform:scale(1.02)] sm:p-6"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[var(--teal-mid)]/45 text-[var(--teal)]">
                <Icon />
              </span>
              <h3 className="mt-4 text-[16px] font-bold leading-snug text-[var(--gray-900)]">{title}</h3>
              <p className="mt-2 flex-1 text-[13px] leading-relaxed text-neutral-600 sm:text-[14px]">{body}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/auth/inscription"
            aria-label="Recevoir mon plan nutritionnel personnalisé — démarrer l’évaluation"
            className="inline-flex items-center justify-center rounded-[10px] bg-[var(--teal)] px-6 py-3 text-[14px] font-semibold text-white shadow-sm transition hover:opacity-95 hover:[transform:scale(1.02)] active:scale-[0.99]"
          >
            Recevoir mon plan nutritionnel personnalisé
          </Link>
        </div>
      </div>
    </section>
  );
}
