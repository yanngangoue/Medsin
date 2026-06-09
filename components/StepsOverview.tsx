function IconDoc() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className="text-[var(--teal)]">
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconPersonDoc() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className="text-[var(--teal)]">
      <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 4h3v3M19.5 5.5h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconRx() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className="text-[var(--teal)]">
      <path d="M14 2L4 12l4 4M10 6l10 10M10 18l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="18" cy="6" r="2" fill="currentColor" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className="text-[var(--teal)]">
      <path
        d="M21 8v8l-9 4-9-4V8l9-4 9 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="m3 8 9 4 9-4M12 12v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const STEPS = [
  {
    num: "01",
    title: "Onboarding en ligne",
    Icon: IconDoc,
    desc: "Questionnaire santé complet en 5 minutes : antécédents, médicaments actuels, IMC et objectifs.",
  },
  {
    num: "02",
    title: "Révision médicale",
    Icon: IconPersonDoc,
    desc: "Un professionnel de santé licencié analyse votre dossier et détermine votre éligibilité au GLP-1.",
  },
  {
    num: "03",
    title: "Prescription si éligible",
    Icon: IconRx,
    desc: "Si approuvé, votre ordonnance est émise et transmise à la pharmacie partenaire sous 24 h.",
  },
  {
    num: "04",
    title: "Livraison + suivi",
    Icon: IconBox,
    desc: "Médicament livré en 48 h. Suivi médical continu via portail patient sécurisé et assistance 24 h/24.",
  },
] as const;

function ConnectorArrow() {
  return (
    <div className="flex w-6 shrink-0 items-center justify-center self-center text-[20px] font-bold text-[var(--teal)] lg:w-8 lg:text-[22px]" aria-hidden>
      →
    </div>
  );
}

export function StepsOverview() {
  return (
    <section className="bg-[var(--teal-light)] py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-[28px] font-bold tracking-tight text-[var(--gray-900)] sm:text-[34px]">
            4 étapes, c&apos;est tout
          </h2>
          <p className="mt-3 text-[16px] text-[var(--gray-muted)] sm:text-[17px]">
            De votre canapé à votre objectif — entièrement en ligne
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-4 md:hidden">
          {STEPS.map((step, i) => (
            <div key={step.num}>
              <article className="rounded-[14px] border border-[var(--border-soft)] bg-white p-5 shadow-sm transition hover:[transform:scale(1.02)]">
                <span className="text-[40px] font-black leading-none text-neutral-200">{step.num}</span>
                <div className="mt-3 flex h-11 w-11 items-center justify-center rounded-[10px] bg-[var(--teal-mid)]/60">
                  <step.Icon />
                </div>
                <h3 className="mt-3 text-[17px] font-bold text-[var(--gray-900)]">{step.title}</h3>
                <p className="mt-2 text-[14px] leading-snug text-[var(--gray-muted)]">{step.desc}</p>
              </article>
              {i < STEPS.length - 1 ? (
                <div className="flex justify-center py-1 text-[20px] font-bold text-[var(--teal)]" aria-hidden>
                  ↓
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-12 hidden items-stretch md:flex md:gap-1 lg:gap-2">
          {STEPS.flatMap((step, i) => [
            <article
              key={step.num}
              className="flex min-w-0 flex-1 flex-col rounded-[14px] border border-[var(--border-soft)] bg-white p-5 shadow-sm transition hover:[transform:scale(1.02)]"
            >
              <span className="text-[34px] font-black leading-none text-neutral-200 lg:text-[40px]">{step.num}</span>
              <div className="mt-3 flex h-11 w-11 items-center justify-center rounded-[10px] bg-[var(--teal-mid)]/60">
                <step.Icon />
              </div>
              <h3 className="mt-3 text-[14px] font-bold leading-snug text-[var(--gray-900)] lg:text-[16px]">{step.title}</h3>
              <p className="mt-2 flex-1 text-[12px] leading-snug text-[var(--gray-muted)] lg:text-[13px]">{step.desc}</p>
            </article>,
            i < STEPS.length - 1 ? <ConnectorArrow key={`conn-${i}`} /> : null,
          ])}
        </div>
      </div>
    </section>
  );
}
