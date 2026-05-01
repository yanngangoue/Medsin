import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&q=90";

function ShieldIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0 text-teal-700"
      aria-hidden
    >
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeroSection() {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-12 pt-8 sm:px-6 sm:pt-12">
      <div className="flex flex-col gap-10 md:flex-row md:items-start md:gap-10">
        <div className="min-w-0 flex-1">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-none">
            <ShieldIcon />
            Médecins certifiés au Canada
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Accompagnement perte de poids <span className="text-teal-700">GLP‑1</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-snug text-slate-600">
            Consultation médicale en ligne. Ordonnance rapide. Suivi personnalisé.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/onboarding/inscription">
              <Button className="px-6 py-3 text-base shadow-lg shadow-teal-900/15">Commencer</Button>
            </Link>
            <Link href="/connexion">
              <Button variant="outline" className="px-6 py-3 text-base">
                J’ai déjà un compte
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-slate-500">
            Médecins agréés · 100% en ligne · Résultat en 24h
          </p>
        </div>

        <div className="relative hidden h-[min(520px,70vh)] w-[420px] max-w-full shrink-0 md:block">
          <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-md shadow-teal-900/10 ring-0">
            <Image
              src={HERO_IMAGE}
              alt="Femme active et souriante, pleine d’énergie positive"
              fill
              className="object-cover"
              sizes="420px"
              priority
            />
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-teal-700/20 via-teal-500/5 to-white/25"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 rounded-b-2xl bg-gradient-to-t from-white/50 via-transparent to-transparent"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </section>
  );
}
