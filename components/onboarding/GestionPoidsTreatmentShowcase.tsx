import {
  GLP1_SCIENCE_STATS,
  GLP1_TREATMENT_CARDS,
  type Glp1TreatmentCard,
} from "@/lib/patient/glp1-treatment-cards";
import { HoverZoomImage } from "@/components/ui/HoverZoomImage";

function TreatmentCard({ card }: { card: Glp1TreatmentCard }) {
  const isProduct = card.variant === "product";

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.05]">
      <HoverZoomImage
        src={card.image}
        alt={card.imageAlt}
        fill
        unoptimized={card.localImage}
        zoom={isProduct ? "subtle" : "default"}
        containerClassName={`aspect-[4/5] w-full sm:aspect-[3/4] ${card.panelClass}`}
        imageClassName={
          isProduct
            ? "object-contain p-5 brightness-[1.02] contrast-[0.96] sm:p-6"
            : "object-cover object-center brightness-[1.04] contrast-[0.9] saturate-[0.88]"
        }
        sizes="(max-width: 640px) 50vw, 25vw"
      />
      <div className="border-t border-slate-100 px-3 py-4 text-center sm:px-4 sm:py-5">
        <h3 className="text-sm font-bold text-slate-900 sm:text-[15px]">{card.title}</h3>
        <p className="mt-1 text-[11px] leading-snug text-slate-500 sm:text-xs">{card.description}</p>
      </div>
    </article>
  );
}

export function GestionPoidsTreatmentShowcase() {
  return (
    <section
      id="comprendre-glp1"
      className="border-t border-slate-200/50 bg-white py-12 sm:py-16"
      aria-labelledby="glp-science-title"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#1D9E75]">
            Comprendre le GLP-1
          </p>
          <h2
            id="glp-science-title"
            className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]"
          >
            Choisissez la forme qui vous convient
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
            Les agonistes GLP-1 imitent une hormone naturelle qui régule l&apos;appétit. Votre médecin
            détermine le traitement adapté après évaluation de votre dossier.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {GLP1_TREATMENT_CARDS.map((card) => (
            <TreatmentCard key={card.id} card={card} />
          ))}
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {GLP1_SCIENCE_STATS.map(({ value, label }) => (
            <div
              key={label}
              className="rounded-xl border border-[#E8F5F0] bg-[#F8FCFA] px-4 py-4 text-center"
            >
              <p className="text-xl font-black text-[#1D9E75] sm:text-[22px]">{value}</p>
              <p className="mt-1 text-[11px] leading-snug text-slate-600">{label}</p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-[11px] leading-relaxed text-slate-400">
          Prescription uniquement après avis d&apos;un professionnel de santé. Les résultats varient
          selon le profil.
        </p>
      </div>
    </section>
  );
}


