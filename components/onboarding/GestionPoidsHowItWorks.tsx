import { Glp1EvaluationEntryCta } from "@/components/onboarding/Glp1EvaluationEntryCta";

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

function IconTriage() {
  return (
    <svg width="80" height="72" viewBox="0 0 80 72" fill="none" aria-hidden>
      <rect x="14" y="10" width="52" height="52" rx="8" stroke={ICON_COLOR} strokeWidth="1.75" />
      <path d="M26 28h28M26 38h20M26 48h14" stroke={ICON_COLOR} strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="58" cy="22" r="10" fill="#E8F8F2" stroke={ICON_COLOR} strokeWidth="1.75" />
      <path d="M54 22l3 3 6-7" stroke={ICON_COLOR} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
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

function IconConsultation() {
  return (
    <svg width="80" height="72" viewBox="0 0 80 72" fill="none" aria-hidden>
      <rect x="10" y="16" width="44" height="32" rx="6" stroke={ICON_COLOR} strokeWidth="1.75" />
      <circle cx="32" cy="32" r="8" stroke={ICON_COLOR} strokeWidth="1.75" />
      <path d="M54 24h16v28H54" stroke={ICON_COLOR} strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

const STEPS = [
  {
    Icon: IconQuestionnaire,
    title: "Formulaire de santé détaillé",
    description:
      "Questionnaire complet sur votre santé, vos objectifs et vos antécédents (environ 10 minutes).",
  },
  {
    Icon: IconTriage,
    title: "Tri pré-diagnostique",
    description:
      "Un algorithme applique des critères d'exclusion stricts. En cas de risque, le parcours s'arrête ici.",
  },
  {
    Icon: IconDoctor,
    title: "Évaluation professionnelle",
    description:
      "Vos données sont transmises à un professionnel de santé qui analyse votre dossier en profondeur.",
  },
  {
    Icon: IconConsultation,
    title: "Consultation et prescription",
    description:
      "Consultation virtuelle (vidéo synchrone). Seul le professionnel de santé prend la décision finale et prescrit le traitement.",
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
            Votre parcours GLP-1 en 4 étapes
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
            Anne Santé vous accompagne de l&apos;évaluation pré-diagnostique à la prescription encadrée.
            Aucune décision thérapeutique automatisée — le professionnel de santé a le dernier mot.
          </p>
        </div>

        <div className="mt-10 grid gap-10 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {STEPS.map((step, index) => (
            <article key={step.title} className="flex flex-col items-center text-center">
              <span className="mb-2 text-xs font-bold uppercase tracking-wide text-[#1D9E75]">
                Étape {index + 1}
              </span>
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

        <div className="mt-10 flex justify-center sm:mt-12">
          <Glp1EvaluationEntryCta
            className="inline-flex items-center justify-center rounded-full bg-[var(--teal-900)] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[var(--teal)]"
            showGuestLinks={false}
          >
            Commencer mon évaluation
          </Glp1EvaluationEntryCta>
        </div>
      </div>
    </section>
  );
}
