import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

/** Jeunes sportifs souriants en tenue d’entraînement (photo de groupe / équipe). */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1526401485004-46910ecc8e51?w=960&q=85";

const CHECKS = [
  "Questionnaire santé en 5 minutes",
  "Révision par un professionnel de santé licencié",
  "Ordonnance + livraison à domicile en 48h",
  "Suivi médical continu inclus",
] as const;

function IconInjector({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10 4h4v3l4 4v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-8l4-4V4Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M10 10h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconCapsules({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="7" width="8" height="10" rx="3" transform="rotate(-25 8 12)" stroke="currentColor" strokeWidth="1.75" />
      <rect x="11" y="6" width="8" height="10" rx="3" transform="rotate(15 15 11)" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function CheckRow({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-[15px] leading-snug text-neutral-800">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--teal-mid)] text-[12px] font-bold text-[var(--teal)]" aria-hidden>
        ✓
      </span>
      <span>{children}</span>
    </li>
  );
}

export function HeroSection() {
  return (
    <section className="bg-[var(--teal-light)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[55fr_45fr] lg:items-center lg:gap-12 lg:pb-20 lg:pt-14">
        <div className="min-w-0 lg:max-w-none">
          <p className="mb-5 inline-flex items-center gap-2 rounded-[20px] border border-[var(--teal-mid)] bg-white px-4 py-2 text-[13px] font-medium text-[var(--gray-900)] shadow-sm">
            <span aria-hidden>🛡️</span>
            Médecins licenciés au Canada
          </p>

          <h1 className="text-[34px] font-black leading-[1.08] tracking-tight text-[var(--gray-900)] sm:text-[44px] lg:text-[52px]">
            Perdez du poids avec le{" "}
            <span className="text-[var(--teal)]">GLP-1</span>
            <span> — depuis chez vous</span>
          </h1>

          <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-[var(--gray-muted)] sm:text-[17px]">
            Onboarding en ligne, révision médicale, ordonnance si éligible, livraison et suivi
            personnalisé. Simple. Rapide. Encadré.
          </p>

          <ul className="mt-8 space-y-3">
            {CHECKS.map((line) => (
              <CheckRow key={line}>{line}</CheckRow>
            ))}
          </ul>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/onboarding/inscription"
              aria-label="Commencer mon évaluation médicale"
              className="inline-flex h-[52px] items-center justify-center rounded-[10px] bg-[var(--teal)] px-8 text-[15px] font-bold text-white shadow-sm transition hover:opacity-95 hover:[transform:scale(1.02)] active:scale-[0.99]"
            >
              Commencer mon évaluation →
            </Link>
            <Link
              href="/patient"
              aria-label="Voir nos services"
              className="inline-flex h-[52px] items-center justify-center rounded-[10px] border border-[var(--border-soft)] bg-white px-8 text-[15px] font-bold text-[var(--gray-900)] shadow-sm transition hover:bg-neutral-50 hover:[transform:scale(1.02)] active:scale-[0.99]"
            >
              Voir nos services
            </Link>
          </div>

          <p className="mt-6 text-[14px] text-[var(--gray-muted)]" aria-label="Avis patients">
            ⭐⭐⭐⭐⭐ +12 000 patients · Note 4.9/5
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] shadow-sm ring-1 ring-black/[0.06] sm:aspect-[3/4]">
            <Image
              src={HERO_IMAGE}
              alt="Jeunes femme et homme souriants en tenue sportive avec leur équipe après l’entraînement"
              fill
              className="object-cover object-[center_35%]"
              sizes="(max-width: 1024px) 100vw, 45vw"
              priority
            />

            {/* Éléments graphiques génériques (non médicaments de marque) pour évoquer l’accompagnement GLP-1 */}
            <div className="pointer-events-none absolute right-3 top-3 flex max-w-[200px] flex-col gap-2 sm:right-4 sm:top-4">
              <div className="flex items-center gap-2 rounded-[12px] border border-white/80 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-[2px]">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--teal-light)] text-[var(--teal)]">
                  <IconInjector />
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--teal)]">GLP-1</p>
                  <p className="text-[10px] text-neutral-600">Plan prescrit si éligible</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-[12px] border border-white/80 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-[2px]">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--teal-mid)]/50 text-[var(--teal)]">
                  <IconCapsules />
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="text-[11px] font-bold text-[var(--dark)]">Traitement</p>
                  <p className="text-[10px] text-neutral-600">Livraison & titration guidée</p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4 max-w-[260px] rounded-[12px] border border-[var(--border-soft)] bg-white p-4 shadow-sm sm:bottom-6 sm:left-6 sm:right-auto">
            <p className="text-[15px] font-bold text-[var(--gray-900)]">📉 −14 kg en 3 mois</p>
            <p className="mt-1 text-[13px] text-[var(--gray-muted)]">Sophie M. · Montréal</p>
            <p className="mt-2 text-[13px] text-amber-500" aria-hidden>
              ⭐⭐⭐⭐⭐
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
