import Image from "next/image";
import Link from "next/link";
import { MedsimLogo } from "@/components/MedsimLogo";
import { RepasSanteCreateBox } from "@/components/onboarding/RepasSanteCreateBox";
import { RepasSanteHowItWorks } from "@/components/onboarding/RepasSanteHowItWorks";
import { REPAS_MEALS } from "@/lib/patient/repas-meals";

/** Assiettes du hero — collage type MEDVi (vue plongeante) */
const HERO_PLATES = [
  {
    src: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=700&q=85",
    alt: "Assiette colorée poulet, riz et légumes rôtis",
    size: "h-[150px] w-[150px] sm:h-[185px] sm:w-[185px] lg:h-[210px] lg:w-[210px]",
    position: "right-[-8%] top-1/2 z-30 -translate-y-[58%]",
  },
  {
    src: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=85",
    alt: "Salade fraîche aux légumes et pois chiches",
    size: "h-[95px] w-[95px] sm:h-[120px] sm:w-[120px] lg:h-[135px] lg:w-[135px]",
    position: "right-[18%] top-1/2 z-20 -translate-y-[95%]",
  },
  {
    src: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7440?w=600&q=85",
    alt: "Saumon grillé avec légumes",
    size: "h-[130px] w-[130px] sm:h-[165px] sm:w-[165px] lg:h-[185px] lg:w-[185px]",
    position: "right-[-4%] top-1/2 z-40 -translate-y-[8%]",
  },
  {
    src: "https://images.unsplash.com/photo-1512058564366-58b49b738b7f?w=500&q=85",
    alt: "Bol protéiné riz et légumes",
    size: "h-[105px] w-[105px] sm:h-[130px] sm:w-[130px] lg:h-[150px] lg:w-[150px]",
    position: "right-[26%] top-1/2 z-[25] -translate-y-[5%]",
  },
  {
    src: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=450&q=85",
    alt: "Bol équilibré avocat et légumes",
    size: "h-[85px] w-[85px] sm:h-[105px] sm:w-[105px] lg:h-[120px] lg:w-[120px]",
    position: "right-[38%] top-1/2 z-10 -translate-y-[42%]",
  },
] as const;

function MealPlate({
  src,
  alt,
  size,
  position,
  priority,
}: {
  src: string;
  alt: string;
  size: string;
  position: string;
  priority?: boolean;
}) {
  return (
    <div className={`absolute ${position} ${size}`}>
      <div
        className={`relative h-full w-full rounded-full bg-white p-1.5 shadow-[0_8px_28px_rgba(42,31,24,0.12)] ring-1 ring-black/[0.06] sm:p-2`}
      >
        <div className="relative h-full w-full overflow-hidden rounded-full">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 40vw, 300px"
            priority={priority}
          />
        </div>
      </div>
    </div>
  );
}

function HeroPlatesCollage() {
  return (
    <div
      className="relative mx-auto h-[200px] w-full max-w-[340px] sm:h-[240px] sm:max-w-[380px] md:mx-0 md:h-[260px] md:max-w-none lg:h-[270px]"
      aria-hidden
    >
      {HERO_PLATES.map((plate, i) => (
        <MealPlate key={plate.src} {...plate} priority={i === 0} />
      ))}
    </div>
  );
}

export function RepasSanteLanding() {
  return (
    <div className="flex flex-col bg-[#FAF7F4]">
      <div className="bg-[var(--teal-900)] px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
        Une livraison gratuite par semaine
      </div>

      <header className="border-b border-stone-200/80 bg-[#FAF7F4]/95 px-4 py-3 backdrop-blur-sm sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="shrink-0">
            <MedsimLogo className="text-xl" />
          </Link>
          <nav className="hidden items-center gap-5 text-[10px] font-semibold uppercase tracking-wide text-[#3D2E24] sm:flex sm:text-[11px]">
            <a href="#menu-semaine" className="hover:text-[#D4845F]">
              Menu de la semaine
            </a>
            <a href="#comment-ca-marche" className="hover:text-[#D4845F]">
              Comment ça marche
            </a>
            <span className="text-stone-400">FAQ</span>
          </nav>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/connexion?callbackUrl=/onboarding/repas-sante"
              className="text-sm font-medium text-[#3D2E24] hover:text-[#D4845F]"
            >
              Se connecter
            </Link>
            <Link
              href="/onboarding/inscription?service=repas-sante"
              className="rounded-md bg-[var(--teal-900)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--teal)]"
            >
              Inscrivez-vous
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#FAF7F4]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(214 203 193 / 0.45) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8 lg:py-9">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5 lg:gap-6">
            <div className="relative z-10 min-w-0 flex-1 sm:max-w-[48%] lg:max-w-[46%]">
              <p className="text-2xl font-bold tracking-tight text-[#2A1F18] sm:text-3xl lg:text-[2.1rem] lg:leading-none">
                MedSim
              </p>
              <h1 className="mt-2 text-2xl font-bold leading-[1.15] tracking-tight text-[#2A1F18] sm:text-3xl lg:text-[1.75rem]">
                Repas santé.
                <br />
                Plus de protéines.
                <br />
                Moins de stress.
              </h1>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-[#5C4A40] sm:text-[15px]">
                Commandez ici : nos restaurants partenaires préparent vos repas santé, validés par
                nos nutritionnistes pour votre parcours.
              </p>
            </div>

            <div className="relative w-full shrink-0 sm:w-[50%] sm:max-w-[440px] lg:-mr-10 lg:w-[52%] lg:overflow-visible xl:-mr-14">
              <HeroPlatesCollage />
            </div>
          </div>
        </div>
      </section>

      <RepasSanteHowItWorks />

      <section
        id="menu-semaine"
        className="border-t border-[#E8A87C]/25 bg-[#FFF4ED] py-14 sm:py-16"
        aria-labelledby="meal-gallery-title"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#D4845F]">
              Menu de la semaine
            </p>
            <h2
              id="meal-gallery-title"
              className="mt-2 text-2xl font-bold tracking-tight text-[#2A1F18] sm:text-3xl"
            >
              Plusieurs repas, une seule philosophie
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#5C4A40]">
              Aperçu des plats proposés par nos restaurants partenaires — commandez sur MedSim, ils
              s&apos;occupent de la préparation.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {REPAS_MEALS.map((meal) => (
              <figure
                key={meal.id}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5 transition hover:shadow-lg"
              >
                <Image
                  src={meal.src}
                  alt={meal.alt}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 280px"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 pb-3 pt-10">
                  <span className="text-sm font-semibold text-white">{meal.label}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <RepasSanteCreateBox meals={REPAS_MEALS} />
    </div>
  );
}
