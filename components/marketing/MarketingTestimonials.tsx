const ITEMS = [
  {
    quote:
      "J'ai perdu 11 kg en 5 mois. Anne m'a aidée à traverser les premières semaines — elle m'écrivait avant même que j'aie des questions.",
    name: "Marie-Ève L.",
    meta: "Québec · −11 kg",
  },
  {
    quote:
      "Enfin un service en vrai français québécois. Mon IPS a répondu en moins de 24 h. Le suivi avec Anne est incroyable.",
    name: "Patrick G.",
    meta: "Montréal · −8 kg",
  },
  {
    quote:
      "Anne remarque des choses que j'aurais jamais signalées moi-même. Elle m'a prévenu que mon rythme allait ralentir avant même que ça arrive.",
    name: "Josée T.",
    meta: "Laval · −14 kg",
  },
  {
    quote:
      "Les questions sont directes et faciles. Je peux poser mes inquiétudes et Anne-sante répond vite. Mon ordonnance est toujours à jour.",
    name: "Isabelle R.",
    meta: "Sherbrooke · −9 kg",
  },
  {
    quote:
      "Mon expérience est très positive. J'atteins mes objectifs lentement mais sûrement avec l'aide d'Anne-sante. Je me sens entre de bonnes mains.",
    name: "Caroline D.",
    meta: "Gatineau · −12 kg",
  },
  {
    quote:
      "L'équipe est accueillante et à l'écoute. Quand j'appelle, j'obtiens une vraie réponse humaine — pas un robot.",
    name: "Marc-André B.",
    meta: "Québec · −7 kg",
  },
  {
    quote:
      "Perdre du poids sans régime fou ni cardio extrême… ça semblait magique. Je me sens tellement mieux au quotidien.",
    name: "Sophie M.",
    meta: "Montréal · −14 kg",
  },
  {
    quote:
      "Tout était rapide et clair. On m'a expliqué les attentes, le suivi et les changements de dose. Très professionnel.",
    name: "Émilie P.",
    meta: "Longueuil · −10 kg",
  },
] as const;

function Card({ quote, name, meta }: (typeof ITEMS)[number]) {
  return (
    <figure className="mx-3 w-[min(100vw-2rem,340px)] shrink-0 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:w-[360px]">
      <p className="text-[#F59E0B]" aria-label="5 étoiles">
        ⭐⭐⭐⭐⭐
      </p>
      <blockquote className="mt-4 text-[15px] leading-relaxed text-gray-600">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="mt-5 border-t border-gray-100 pt-4">
        <p className="text-sm font-semibold text-[#1A1A2E]">{name}</p>
        <p className="text-xs text-gray-500">{meta}</p>
      </figcaption>
    </figure>
  );
}

function Track() {
  return (
    <div className="flex shrink-0">
      {ITEMS.map((item) => (
        <Card key={item.name} {...item} />
      ))}
    </div>
  );
}

export function MarketingTestimonials() {
  return (
    <section className="overflow-hidden bg-[#FAFAF8] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <p className="label-caps text-center text-[#1D4D3A]">Ceux qui ont choisi Anne-sante</p>
        <h2 className="mt-3 text-center text-3xl font-black tracking-tight text-[#1A1A2E] sm:text-4xl lg:text-5xl">
          Il y a une raison pour laquelle nos patients nous recommandent
        </h2>
        <p className="mt-3 text-center text-xs text-gray-400">
          Témoignages fictifs à titre illustratif
        </p>
      </div>

      <div className="comments-marquee-mask mt-12">
        <div className="comments-marquee-track flex w-max">
          <Track />
          <Track />
        </div>
      </div>
    </section>
  );
}
