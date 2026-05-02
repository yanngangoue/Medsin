import Image from "next/image";

const SCIENCE_IMAGE =
  "https://images.unsplash.com/photo-1532187863486-de326f703798?w=900&q=85";

const MINI_STATS = [
  { value: "6x", label: "Plus efficace que régime seul" },
  { value: "18%", label: "Perte de poids corporel moyenne" },
  { value: "93%", label: "Maintien des résultats long terme" },
] as const;

export function ScienceSection() {
  return (
    <section className="bg-[var(--teal-50)] py-14 sm:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[12px] shadow-sm ring-1 ring-black/[0.06]">
          <Image
            src={SCIENCE_IMAGE}
            alt="Représentation moléculaire et recherche en laboratoire pharmaceutique"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div className="min-w-0">
          <h2 className="text-[28px] font-bold tracking-tight text-[var(--gray-900)] sm:text-[32px]">
            Comment fonctionne le GLP-1 ?
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-neutral-600">
            Le GLP-1 (glucagon-like peptide-1) est une hormone naturellement produite par votre corps
            après les repas. Elle régule l&apos;appétit, ralentit la digestion et stabilise la glycémie.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-neutral-600">
            Les médicaments GLP-1 miment cette hormone — vous aidant à vous sentir rassasié plus longtemps
            et à manger naturellement moins, sans régime strict ni volonté surhumaine.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {MINI_STATS.map(({ value, label }) => (
              <div
                key={label}
                className="rounded-[12px] border border-white/80 bg-white p-4 text-center shadow-sm transition hover:[transform:scale(1.02)]"
              >
                <p className="text-[22px] font-black text-[var(--teal-400)]">{value}</p>
                <p className="mt-1 text-[11px] leading-snug text-neutral-600">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
