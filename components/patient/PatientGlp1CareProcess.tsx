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
      className={`mx-auto mt-6 w-full max-w-md sm:mt-8 md:max-w-5xl ${className}`.trim()}
    >
      <div className="grid grid-cols-2 items-stretch gap-2.5 sm:gap-3 md:grid-cols-4 md:gap-4">
        {STEPS.map((step) => (
          <article
            key={step.title}
            className={`relative aspect-square min-h-[9rem] min-w-0 overflow-hidden rounded-xl text-left shadow-md ring-1 ring-white/20 transition hover:-translate-y-0.5 hover:shadow-lg sm:min-h-[10rem] sm:rounded-2xl ${
              "highlighted" in step && step.highlighted ? "ring-2 ring-[#3EBD93]" : ""
            }`}
          >
            {/* img statique WebP (~45 Ko) : chargement fiable sur mobile, sans lazy ni optimiseur Next */}
            <img
              src={step.image}
              alt={"alt" in step ? step.alt : ""}
              width={800}
              height={800}
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
            <div className="absolute inset-x-0 bottom-0 px-2 pb-2 pt-6 sm:px-3 sm:pb-3 sm:pt-8">
              <h3 className="text-[10px] font-semibold leading-tight text-white sm:text-sm">
                {step.title}
              </h3>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
