import {
  NUTRI_PLUS_HERO,
  NUTRI_PLUS_POSITIONING,
  NUTRI_PLUS_TRUST_PILLARS,
} from "@/lib/patient/nutri-plus-content";
import { NutriPlusImage } from "@/components/onboarding/NutriPlusImage";
import {
  MEDSIM_IMG_SUIVI_CHOIX,
  MEDSIM_IMG_SUIVI_CHOIX_ALT,
  MEDSIM_IMG_SUIVI_QUESTIONNAIRE,
  MEDSIM_IMG_SUIVI_QUESTIONNAIRE_ALT,
} from "@/lib/patient/nutri-plus-images";

export function NutriPlusAccueilSection() {
  return (
    <section
      id="accueil"
      className="relative scroll-mt-24 overflow-hidden bg-[#F5F0EB] px-4 py-10 sm:px-8 sm:py-14"
      aria-labelledby="nutri-accueil-title"
    >
      <div
        className="pointer-events-none absolute -right-24 top-8 h-80 w-80 rounded-full bg-[#1D9E75]/[0.08] blur-3xl"
        aria-hidden
      />
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#C8E6D9] bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1D9E75]">
              Nutri<span className="text-[var(--teal-900)]">+</span>
            </span>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {NUTRI_PLUS_HERO.eyebrow}
            </p>
            <h1
              id="nutri-accueil-title"
              className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-[42px] sm:leading-[1.08]"
            >
              {NUTRI_PLUS_HERO.subtitle}
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-[16px]">
              {NUTRI_PLUS_HERO.body}
            </p>

            <div className="mt-6 rounded-2xl border border-[#C8E6D9]/70 bg-white/95 p-5 shadow-sm ring-1 ring-[#1D9E75]/10">
              <p className="text-sm font-bold text-slate-900">{NUTRI_PLUS_POSITIONING.title}</p>
              <p className="mt-2 text-sm font-medium text-[#1D9E75]">{NUTRI_PLUS_POSITIONING.lead}</p>
            </div>

            <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {NUTRI_PLUS_TRUST_PILLARS.map((p) => (
                <li
                  key={p.label}
                  className="rounded-xl border border-white/80 bg-white px-3 py-2.5 text-center shadow-sm"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#1D9E75]">
                    {p.label}
                  </p>
                  <p className="mt-1 text-[10px] leading-snug text-slate-500">{p.detail}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 mx-auto w-full max-w-md lg:max-w-none">
            <div className="overflow-hidden rounded-3xl bg-white p-2 shadow-xl ring-1 ring-[#1D9E75]/15">
              <figure className="relative overflow-hidden rounded-2xl bg-[#EDE4DC]">
                <div className="relative aspect-[5/4] w-full">
                  <NutriPlusImage
                    src={MEDSIM_IMG_SUIVI_CHOIX}
                    alt={MEDSIM_IMG_SUIVI_CHOIX_ALT}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 90vw, 480px"
                    priority
                  />
                </div>
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--teal-900)]/85 to-transparent px-4 pb-4 pt-16">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8E6D9]">
                    Nutri+
                  </span>
                  <p className="mt-1 text-lg font-bold text-white">Consultation en ligne</p>
                </figcaption>
              </figure>
              <figure className="relative mt-2 overflow-hidden rounded-2xl bg-[#EDE4DC]">
                <div className="relative aspect-[16/9] w-full">
                  <NutriPlusImage
                    src={MEDSIM_IMG_SUIVI_QUESTIONNAIRE}
                    alt={MEDSIM_IMG_SUIVI_QUESTIONNAIRE_ALT}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 90vw, 480px"
                    priority
                  />
                </div>
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/70 to-transparent px-4 pb-3 pt-10">
                  <p className="text-sm font-semibold text-white">Suivi alimentaire au quotidien</p>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
