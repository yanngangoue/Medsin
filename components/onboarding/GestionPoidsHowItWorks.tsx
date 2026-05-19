const ICON_COLOR = "#1D9E75";

function IconQuestionnaire() {
  return (
    <svg width="80" height="72" viewBox="0 0 80 72" fill="none" aria-hidden>
      <rect x="12" y="8" width="40" height="52" rx="4" stroke={ICON_COLOR} strokeWidth="1.75" />
      <path d="M22 22h20M22 32h20M22 42h12" stroke={ICON_COLOR} strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="58" cy="48" r="14" stroke={ICON_COLOR} strokeWidth="1.75" />
      <path d="M52 48l4 4 8-8" stroke={ICON_COLOR} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconDoctor() {
  return (
    <svg width="80" height="72" viewBox="0 0 80 72" fill="none" aria-hidden>
      <circle cx="40" cy="22" r="12" stroke={ICON_COLOR} strokeWidth="1.75" />
      <path
        d="M16 62c0-14 10-24 24-24s24 10 24 24"
        stroke={ICON_COLOR}
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M58 28h12v8M64 32h-12" stroke={ICON_COLOR} strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconTreatment() {
  return (
    <svg width="80" height="72" viewBox="0 0 80 72" fill="none" aria-hidden>
      <rect x="20" y="16" width="24" height="44" rx="12" stroke={ICON_COLOR} strokeWidth="1.75" />
      <path d="M32 16V10M28 10h8" stroke={ICON_COLOR} strokeWidth="1.75" strokeLinecap="round" />
      <path
        d="M48 36h20l-6 12H54l-6-12Z"
        stroke={ICON_COLOR}
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="58" cy="52" r="6" stroke={ICON_COLOR} strokeWidth="1.75" />
    </svg>
  );
}

const STEPS = [
  {
    Icon: IconQuestionnaire,
    title: "Questionnaire en ligne",
    description:
      "Répondez à quelques questions sur votre santé, vos objectifs et votre historique GLP-1 (environ 5 minutes).",
  },
  {
    Icon: IconDoctor,
    title: "Révision médicale",
    description:
      "Un professionnel de santé analyse votre dossier et détermine si un traitement GLP-1 vous convient.",
  },
  {
    Icon: IconTreatment,
    title: "Traitement et suivi",
    description:
      "Prescription encadrée, livraison discrète et accompagnement nutritionnel pour des résultats durables.",
  },
] as const;

export function GestionPoidsHowItWorks() {
  return (
    <section
      id="comment-ca-marche"
      className="border-t border-slate-200/60 bg-white py-12 sm:py-14"
      aria-labelledby="glp-how-title"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="glp-how-title"
            className="text-lg font-bold uppercase leading-snug tracking-wide text-slate-900 sm:text-xl"
          >
            Votre parcours GLP-1 en 3 étapes
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
            MedSim vous accompagne de l&apos;évaluation initiale au suivi, en toute confidentialité.
            Aucune prescription sans avis médical.
          </p>
        </div>

        <div className="mt-10 grid gap-10 sm:mt-12 sm:grid-cols-3 sm:gap-6 lg:gap-8">
          {STEPS.map((step) => (
            <article key={step.title} className="flex flex-col items-center text-center">
              <div className="flex h-20 items-center justify-center">
                <step.Icon />
              </div>
              <h3 className="mt-4 text-sm font-bold uppercase leading-snug tracking-wide text-slate-900 sm:text-[13px]">
                {step.title}
              </h3>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-600">{step.description}</p>
            </article>
          ))}
        </div>

        <p className="mt-10 text-center sm:mt-12">
          <a
            href="#commencer"
            className="inline-flex items-center justify-center rounded-full bg-[var(--teal-900)] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[var(--teal)]"
          >
            Commencer mon évaluation
          </a>
        </p>
      </div>
    </section>
  );
}
