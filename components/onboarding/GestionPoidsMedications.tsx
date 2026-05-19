import Image from "next/image";
import { GLP1_MEDICATIONS } from "@/lib/patient/glp1-content";

export function GestionPoidsMedications() {
  return (
    <section
      id="traitements"
      className="border-t border-slate-200/60 bg-[#F0F0F0] py-14 sm:py-16"
      aria-labelledby="glp-meds-title"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#1D9E75]">
            Traitements GLP-1
          </p>
          <h2
            id="glp-meds-title"
            className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
          >
            Des options adaptées à votre profil
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Prescription uniquement après évaluation médicale. Votre médecin détermine le traitement le
            plus approprié pour vous.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {GLP1_MEDICATIONS.map((med) => (
            <article
              key={med.id}
              className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5"
            >
              <div className="relative aspect-[4/3] w-full bg-slate-50">
                <Image
                  src={med.image}
                  alt={med.imageAlt}
                  fill
                  unoptimized={med.localImage}
                  className={med.localImage ? "object-contain p-4" : "object-cover"}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {med.badge ? (
                  <span className="absolute left-3 top-3 rounded-full bg-[#1D9E75] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                    {med.badge}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <h3 className="text-lg font-bold text-slate-900">{med.name}</h3>
                <p className="mt-1 text-sm font-medium text-[#1D9E75]">
                  {med.ingredient} · {med.form}
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{med.description}</p>
                <ul className="mt-4 space-y-2">
                  {med.highlights.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-slate-700">
                      <span className="text-[#1D9E75]" aria-hidden>
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
