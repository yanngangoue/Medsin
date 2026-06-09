function IconClipboard() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden className="text-[var(--teal-400)]">
      <rect x="8" y="2" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
      <path
        d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconStethoscope() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden className="text-[var(--teal-400)]">
      <path
        d="M6 4v6a6 6 0 0 0 12 0V4M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2M9 20h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="14" r="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconDelivery() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden className="text-[var(--teal-400)]">
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
    n: 1,
    title: "Évaluation en ligne",
    Icon: IconClipboard,
    desc: "Remplissez un questionnaire médical complet (5 min). Vos antécédents, médicaments actuels et objectifs.",
  },
  {
    n: 2,
    title: "Révision par un médecin",
    Icon: IconStethoscope,
    desc: "Un médecin licencié analyse votre dossier et détermine si le GLP-1 est approprié pour vous.",
  },
  {
    n: 3,
    title: "Livraison à domicile",
    Icon: IconDelivery,
    desc: "Votre ordonnance est envoyée à une pharmacie partenaire. Livraison discrète en 48 h. Kit complet inclus.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="scroll-mt-24 bg-[var(--teal-50)] py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-[28px] font-bold tracking-tight text-[var(--gray-900)] sm:text-[32px]">
            3 étapes vers vos résultats
          </h2>
          <p className="mt-3 text-[16px] text-neutral-600 sm:text-[17px]">
            Simple, rapide, 100 % en ligne
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ n, title, Icon, desc }) => (
            <article
              key={n}
              className="rounded-[12px] border border-white/80 bg-white p-6 shadow-sm transition hover:[transform:scale(1.02)]"
            >
              <span className="text-[48px] font-black leading-none text-[var(--teal-400)]">{n}</span>
              <div className="mt-4 flex items-center gap-2">
                <Icon />
                <h3 className="text-[17px] font-bold text-[var(--gray-900)]">{title}</h3>
              </div>
              <p className="mt-3 text-[14px] leading-relaxed text-neutral-600">{desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
