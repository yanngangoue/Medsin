import Link from "next/link";

function IconMetabolic({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 19V5M8 19v-6M12 19V9M16 19v-4M20 19v-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconNutrition({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3c-2 4-6 5-6 10a6 6 0 0 0 12 0c0-5-4-6-6-10Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 14v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconSleepStress({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function IconPerformance({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

const CARDS = [
  {
    title: "Suivi métabolique intelligent",
    body: "Indicateurs clés, tendances et ajustements médicaux pour stabiliser glycémie, poids et marqueurs métaboliques.",
    Icon: IconMetabolic,
  },
  {
    title: "Nutrition personnalisée",
    body: "Recommandations alimentaires cohérentes avec votre traitement et votre mode de vie, sans promesse miracle.",
    Icon: IconNutrition,
  },
  {
    title: "Gestion du stress et du sommeil",
    body: "Cadre pour mieux récupérer et réguler le cortisol — facteurs souvent négligés dans la perte de poids durable.",
    Icon: IconSleepStress,
  },
  {
    title: "Performances durables",
    body: "Énergie, habitudes et suivi comportemental pour ancrer les progrès dans le temps, sous supervision clinique.",
    Icon: IconPerformance,
  },
] as const;

export function MetabolicHealthSection() {
  return (
    <section id="approche-sante-complete" className="scroll-mt-24 border-y border-[var(--border-soft)] bg-[var(--teal-light)] py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-[26px] font-bold tracking-tight text-[var(--gray-900)] sm:text-[32px]">
            Votre santé métabolique, encadrée et personnalisée
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-[var(--gray-muted)] sm:text-[17px]">
            Au-delà du traitement médicamenteux, notre approche complète optimise votre équilibre métabolique jour après
            jour.
          </p>
          <p className="mt-5 text-left text-[14px] leading-relaxed text-neutral-700 sm:text-center sm:text-[15px]">
            Medsim propose un accompagnement global : santé métabolique, sommeil, énergie, nutrition et bien-être
            comportemental — articulés autour de votre dossier médical et des décisions de votre professionnel de santé.
            Chaque axe est intégré dans un parcours sobre, mesurable et réaliste.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map(({ title, body, Icon }) => (
            <article
              key={title}
              className="flex flex-col rounded-[14px] border border-[var(--border-soft)] bg-white p-5 shadow-sm transition hover:[transform:scale(1.02)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[var(--teal-mid)]/50 text-[var(--teal)]">
                <Icon />
              </div>
              <h3 className="mt-4 text-[16px] font-bold leading-snug text-[var(--gray-900)]">{title}</h3>
              <p className="mt-2 flex-1 text-[13px] leading-relaxed text-[var(--gray-muted)]">{body}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/auth/inscription"
            aria-label="Explorer notre approche santé complète — commencer l’évaluation"
            className="inline-flex items-center justify-center rounded-[10px] border border-[var(--teal)] bg-white px-6 py-3 text-[14px] font-semibold text-[var(--teal)] shadow-sm transition hover:bg-[var(--teal-light)] hover:opacity-95 hover:[transform:scale(1.02)] active:scale-[0.99]"
          >
            Explorer notre approche santé complète
          </Link>
        </div>
      </div>
    </section>
  );
}
