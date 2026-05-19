const ICON_COLOR = "#1D4D3A";

function IconChooseMeals() {
  return (
    <svg width="80" height="72" viewBox="0 0 80 72" fill="none" aria-hidden>
      <path
        d="M8 28h28c2 0 4 2 4 4v22c0 8-6 14-14 14H22c-8 0-14-6-14-14V32c0-2 2-4 4-4Z"
        stroke={ICON_COLOR}
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M22 28V18c0-4 3-8 8-8h4" stroke={ICON_COLOR} strokeWidth="1.75" strokeLinecap="round" />
      <rect x="44" y="12" width="28" height="36" rx="3" stroke={ICON_COLOR} strokeWidth="1.75" />
      <path d="M52 24h12M52 32h12M52 40h8" stroke={ICON_COLOR} strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="58" cy="20" r="4" stroke={ICON_COLOR} strokeWidth="1.5" />
    </svg>
  );
}

function IconChefDelivery() {
  return (
    <svg width="80" height="72" viewBox="0 0 80 72" fill="none" aria-hidden>
      <ellipse cx="40" cy="52" rx="28" ry="8" stroke={ICON_COLOR} strokeWidth="1.75" />
      <path
        d="M16 52c0-14 10-26 24-26s24 12 24 26"
        stroke={ICON_COLOR}
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M28 30c2-6 8-10 12-10s10 4 12 10" stroke={ICON_COLOR} strokeWidth="1.75" strokeLinecap="round" />
      <path d="M36 8v6M44 8v6M40 6v10" stroke={ICON_COLOR} strokeWidth="1.75" strokeLinecap="round" />
      <path
        d="M32 14c0 4 3.5 8 8 8s8-4 8-8"
        stroke={ICON_COLOR}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconHeatEnjoy() {
  return (
    <svg width="80" height="72" viewBox="0 0 80 72" fill="none" aria-hidden>
      <path
        d="M22 58h36c4 0 8-4 8-8V34c0-4-4-8-8-8H22c-4 0-8 4-8 8v16c0 4 4 8 8 8Z"
        stroke={ICON_COLOR}
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M30 18h20v8H30v-8Z" stroke={ICON_COLOR} strokeWidth="1.75" strokeLinejoin="round" />
      <path
        d="M36 10h8M40 6v8"
        stroke={ICON_COLOR}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M34 6c0-2 2-4 6-4s6 2 6 4"
        stroke={ICON_COLOR}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M36 8c1-3 3-4 4-4M44 8c-1-3-3-4-4-4"
        stroke={ICON_COLOR}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const STEPS = [
  {
    Icon: IconChooseMeals,
    title: "Commandez sur MedSim",
    description:
      "Parcourez le menu des restaurants partenaires et passez votre commande ici, en ligne, en quelques clics.",
  },
  {
    Icon: IconChefDelivery,
    title: "Le restaurant prépare vos repas",
    description:
      "Le resto partenaire que vous avez choisi réalise vos plats frais, selon les repas santé proposés sur la plateforme.",
  },
  {
    Icon: IconHeatEnjoy,
    title: "Livraison ou retrait, puis dégustation",
    description:
      "Recevez votre commande à domicile ou récupérez-la au restaurant, puis savourez sans vous occuper de la cuisine.",
  },
] as const;

export function RepasSanteHowItWorks() {
  return (
    <section
      id="comment-ca-marche"
      className="border-t border-stone-200/50 bg-white py-12 sm:py-14"
      aria-labelledby="how-it-works-title"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="how-it-works-title"
            className="text-lg font-bold uppercase leading-snug tracking-wide text-[#2A1F18] sm:text-xl"
          >
            Du restaurant partenaire à votre assiette : comment ça marche
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#5C4A40] sm:text-[15px]">
            MedSim travaille avec des restaurants partenaires : vous commandez sur notre plateforme,
            ils préparent les repas. Une alimentation équilibrée, alignée avec votre parcours de santé,
            sans avoir à cuisiner vous-même.
          </p>
        </div>

        <div className="mt-10 grid gap-10 sm:mt-12 sm:grid-cols-3 sm:gap-6 lg:gap-8">
          {STEPS.map((step) => (
            <article key={step.title} className="flex flex-col items-center text-center">
              <div className="flex h-20 items-center justify-center">
                <step.Icon />
              </div>
              <h3 className="mt-4 text-sm font-bold uppercase leading-snug tracking-wide text-[#2A1F18] sm:text-[13px]">
                {step.title}
              </h3>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#5C4A40]">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
