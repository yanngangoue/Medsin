import Image from "next/image";

const ITEMS = [
  {
    quote:
      "J'ai perdu 11 kg en 5 mois. Anne m'a aidée à traverser les premières semaines — elle m'écrivait avant même que j'aie des questions.",
    name: "Marie-Ève L.",
    meta: "Québec · -11 kg",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
  },
  {
    quote:
      "Enfin un service en vrai français québécois. Mon IPS a répondu en moins de 24 h. Le suivi avec Anne est incroyable.",
    name: "Patrick G.",
    meta: "Montréal · -8 kg",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  },
  {
    quote:
      "Anne remarque des choses que j'aurais jamais signalées moi-même. Elle m'a prévenu que mon rythme allait ralentir avant même que ça arrive.",
    name: "Josée T.",
    meta: "Laval · -14 kg",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
  },
];

export function MarketingTestimonials() {
  return (
    <section className="bg-[#FAFAF8] py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <h2 className="text-center text-4xl font-black tracking-tight text-[#1A1A2E] md:text-5xl">
          Ce que disent nos patients
        </h2>
        <p className="mt-3 text-center text-xs text-gray-400">
          Témoignages fictifs à titre illustratif
        </p>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {ITEMS.map((t) => (
            <blockquote
              key={t.name}
              className="flex flex-col rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"
            >
              <p className="text-[#F59E0B]" aria-label="5 étoiles">
                ⭐⭐⭐⭐⭐
              </p>
              <p className="mt-6 flex-1 text-base italic leading-relaxed text-gray-600">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="mt-8 flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-full">
                  <Image src={t.photo} alt="" fill className="object-cover" sizes="48px" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A2E]">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.meta}</p>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
