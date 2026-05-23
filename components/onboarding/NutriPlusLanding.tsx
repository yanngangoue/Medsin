import Image from "next/image";
import Link from "next/link";
import { MedsimLogo } from "@/components/MedsimLogo";
import { OnboardingLandingHeaderMenu } from "@/components/onboarding/OnboardingLandingHeaderMenu";
import { NutriPlusCreatePlan } from "@/components/onboarding/NutriPlusCreatePlan";
import { NutriPlusHowItWorks } from "@/components/onboarding/NutriPlusHowItWorks";
import { PartNavAccueilLink } from "@/components/patient/PartNavAccueilLink";
import { NUTRI_COMPLEMENTS } from "@/lib/patient/nutri-plus-complements";
import { NUTRI_PLUS_GALLERY, NUTRI_PLUS_HERO } from "@/lib/patient/nutri-plus-content";
import { NUTRI_PLUS_HERO_PLATES } from "@/lib/patient/nutri-plus-images";
import { PUBLIC_CATALOG_HOME } from "@/lib/public-catalog";

const BG = "#F0F7F4";
const BG_GALLERY = "#E8F5F0";
const ACCENT = "#1D9E75";
const TEXT = "#1A2E24";
const TEXT_MUTED = "#3D5C4A";

function ComplementOrb({
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
      <div className="relative h-full w-full rounded-full bg-white p-1.5 shadow-[0_8px_28px_rgba(29,78,59,0.14)] ring-1 ring-[#1D9E75]/10 sm:p-2">
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

function HeroComplementsCollage() {
  return (
    <div
      className="relative mx-auto h-[200px] w-full max-w-[340px] sm:h-[240px] sm:max-w-[380px] md:mx-0 md:h-[260px] md:max-w-none lg:h-[270px]"
      aria-hidden
    >
      {NUTRI_PLUS_HERO_PLATES.map((plate, i) => (
        <ComplementOrb key={plate.src} {...plate} priority={i === 0} />
      ))}
    </div>
  );
}

export function NutriPlusLanding() {
  return (
    <div className="flex flex-col" style={{ backgroundColor: BG }}>
      <div className="bg-[var(--teal-900)] px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
        Suivi alimentaire · menus adaptés · compléments Nutri+ sur MedSim
      </div>

      <header
        className="border-b px-4 py-3 backdrop-blur-sm sm:px-8"
        style={{ borderColor: "rgb(200 230 217 / 0.6)", backgroundColor: `${BG}f2` }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href={PUBLIC_CATALOG_HOME} className="shrink-0">
            <MedsimLogo className="text-xl" />
          </Link>
          <PartNavAccueilLink className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-[#1D9E75] hover:text-[var(--teal-900)] sm:hidden" />
          <nav className="hidden items-center gap-5 text-[10px] font-semibold uppercase tracking-wide sm:flex sm:text-[11px]">
            <PartNavAccueilLink className="text-[#1A2E24] hover:text-[#1D9E75]" />
            <a href="#nos-complements" className="text-[#1A2E24] hover:text-[#1D9E75]">
              Nos compléments
            </a>
            <a href="#comment-ca-marche" className="text-[#1A2E24] hover:text-[#1D9E75]">
              Comment ça marche
            </a>
            <span className="text-stone-400">FAQ</span>
          </nav>
          <OnboardingLandingHeaderMenu
            loginHref="/auth/connexion?callbackUrl=/onboarding/nutri-plus"
            signupHref="/auth/inscription?service=nutri-plus"
            navLinks={[
              { href: "#nos-complements", label: "Nos compléments" },
              { href: "#comment-ca-marche", label: "Comment ça marche" },
              { href: "#configurer-mon-suivi", label: "Configurer mon suivi" },
            ]}
          />
        </div>
      </header>

      <section className="relative overflow-hidden" style={{ backgroundColor: BG }}>
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(200 230 217 / 0.55) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8 lg:py-9">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5 lg:gap-6">
            <div className="relative z-10 min-w-0 flex-1 sm:max-w-[48%] lg:max-w-[46%]">
              <p
                className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-[2.1rem] lg:leading-none"
                style={{ color: TEXT }}
              >
                MedSim
              </p>
              <h1
                className="mt-2 text-2xl font-bold leading-[1.15] tracking-tight sm:text-3xl lg:text-[1.75rem]"
                style={{ color: TEXT }}
              >
                {NUTRI_PLUS_HERO.titleLines[0]}
                <br />
                {NUTRI_PLUS_HERO.titleLines[1]}
                <br />
                {NUTRI_PLUS_HERO.titleLines[2]}
              </h1>
              <p className="mt-3 max-w-md text-sm leading-relaxed sm:text-[15px]" style={{ color: TEXT_MUTED }}>
                {NUTRI_PLUS_HERO.body}
              </p>
            </div>

            <div className="relative w-full shrink-0 sm:w-[50%] sm:max-w-[440px] lg:-mr-10 lg:w-[52%] lg:overflow-visible xl:-mr-14">
              <HeroComplementsCollage />
            </div>
          </div>
        </div>
      </section>

      <NutriPlusHowItWorks />

      <section
        id="nos-complements"
        className="border-t py-14 sm:py-16"
        style={{ borderColor: "rgb(200 230 217 / 0.5)", backgroundColor: BG_GALLERY }}
        aria-labelledby="complements-gallery-title"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.12em]" style={{ color: ACCENT }}>
              {NUTRI_PLUS_GALLERY.eyebrow}
            </p>
            <h2
              id="complements-gallery-title"
              className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl"
              style={{ color: TEXT }}
            >
              {NUTRI_PLUS_GALLERY.title}
            </h2>
            <p className="mt-3 text-base leading-relaxed" style={{ color: TEXT_MUTED }}>
              {NUTRI_PLUS_GALLERY.lead}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {NUTRI_COMPLEMENTS.map((item) => (
              <figure
                key={item.id}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5 transition hover:shadow-lg"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 280px"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 pb-3 pt-10">
                  <span className="text-sm font-semibold text-white">{item.label}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <NutriPlusCreatePlan />
    </div>
  );
}
