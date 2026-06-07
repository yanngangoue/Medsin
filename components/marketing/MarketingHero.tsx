import Image from "next/image";
import Link from "next/link";

const AVATARS = ["#1D4D3A", "#2D6A4F", "#3EBD93", "#6B7280", "#9CA3AF"];

export function MarketingHero() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <span className="inline-flex rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-600">
            🇨🇦 Disponible partout au Québec
          </span>

          <h1 className="mt-8 text-5xl font-black leading-[1.05] tracking-tight text-[#1A1A2E] sm:text-6xl lg:text-7xl">
            Perdez du poids.
            <br />
            Pour de bon.
          </h1>

          <p className="mt-8 max-w-lg text-lg leading-relaxed text-gray-500 sm:text-xl">
            Ordonnance GLP-1 par une IPS certifiée. Anne, votre coach IA, vous suit chaque
            semaine — sans que vous ayez à demander.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/eligibilite"
              className="inline-flex items-center rounded-full bg-[#1D4D3A] px-8 py-4 text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              Suis-je éligible ? →
            </Link>
            <Link
              href="#tarifs"
              className="inline-flex items-center rounded-full border border-gray-300 bg-white px-8 py-4 text-base font-semibold text-[#1A1A2E] shadow-sm transition-colors hover:border-gray-400"
            >
              Voir les tarifs
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <div className="flex -space-x-2">
              {AVATARS.map((bg, i) => (
                <span
                  key={bg}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white"
                  style={{ backgroundColor: bg, zIndex: AVATARS.length - i }}
                  aria-hidden
                >
                  {String.fromCharCode(65 + i)}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-[#1A1A2E]">4,9/5</span> · 2 000+ patients
              accompagnés
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-sm sm:aspect-square">
            <Image
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=700&q=80"
              alt="Personne active en pleine santé"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          <div className="absolute bottom-5 left-4 right-4 max-w-xs rounded-2xl bg-white p-4 shadow-xl sm:left-6 sm:right-auto">
            <div className="flex items-start gap-3">
              <div className="relative shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1D4D3A] text-sm font-bold text-white">
                  M
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#10B981] animate-pulse-dot" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1A1A2E]">✓ Marie-Ève a perdu 8,2 kg</p>
                <p className="mt-0.5 text-xs text-gray-500">Anne lui écrit ce lundi matin</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
