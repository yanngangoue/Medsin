const STEPS = [
  {
    image: "/images/glp1-process-en-ligne.webp",
    title: "100 % en ligne",
    alt: "Personne consulte MedSim sur tablette depuis chez elle",
  },
  {
    image: "/images/glp1-process-traitement-perso.webp",
    title: "Traitement personnalisé",
    alt: "Stylos injectables GLP-1 pour un traitement personnalisé",
  },
  {
    image: "/images/glp1-process-livraison.webp",
    title: "Livraison",
    alt: "Livreur tenant un colis discret pour livraison à domicile",
  },
  {
    image: "/images/glp1-process-suivi-anne.webp",
    title: "Suivi hebdomadaire",
    alt: "Clavardage sur cellulaire avec Anne, assistante IA MedSim",
    imageClassName: "object-cover object-center",
    highlighted: true,
  },
] as const;

type Props = {
  className?: string;
};

export function PatientGlp1CareProcess({ className = "" }: Props) {
  return (
    <div
      className={`mx-auto mt-6 w-full max-w-6xl px-2 sm:mt-8 sm:px-0 ${className}`.trim()}
    >
      <div className="grid grid-cols-2 items-stretch gap-3 sm:gap-5 md:gap-6">
        {STEPS.map((step) => (
          <article
            key={step.title}
            className={`relative aspect-[4/5] min-h-[10.5rem] min-w-0 overflow-hidden rounded-xl text-left shadow-md ring-1 ring-white/20 transition hover:-translate-y-0.5 hover:shadow-lg sm:min-h-[14rem] sm:rounded-2xl md:min-h-[16rem] lg:min-h-[18rem] ${
              "highlighted" in step && step.highlighted ? "ring-2 ring-[#3EBD93]" : ""
            }`}
          >
            {/* img statique WebP (~45 Ko) : chargement fiable sur mobile, sans lazy ni optimiseur Next */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={step.image}
              alt={"alt" in step ? step.alt : ""}
              width={1200}
              height={1200}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className={`absolute inset-0 h-full w-full ${
                "imageClassName" in step ? step.imageClassName : "object-cover"
              }`}
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
              aria-hidden
            />
            <div className="absolute inset-x-0 bottom-0 px-2 pb-2 pt-8 sm:px-4 sm:pb-4 sm:pt-10">
              <h3 className="text-sm font-semibold leading-tight text-white sm:text-base md:text-lg">
                {step.title}
              </h3>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
