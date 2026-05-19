import Image from "next/image";
import Link from "next/link";
import { MedsimLogo } from "@/components/MedsimLogo";
import { PatientHubNavMenu } from "@/components/patient/PatientHubNavMenu";
import { PATIENT_SERVICE_CARDS } from "@/lib/patient/services";

type Props = {
  prenom?: string;
  showAuthLinks?: boolean;
};

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PatientServicesHub({ showAuthLinks = false }: Props) {
  return (
    <section
      id="patient-services-hub"
      className="relative overflow-hidden bg-[var(--teal-900)] pb-10 pt-6 sm:pb-14 sm:pt-8"
      aria-labelledby="patient-services-heading"
    >
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[var(--teal)]/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-white/5 blur-2xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <MedsimLogo variant="onDark" className="text-xl sm:text-2xl" />
          </Link>
          <PatientHubNavMenu showAuthLinks={showAuthLinks} />
        </div>

        <div className="mx-auto mt-5 max-w-2xl text-center sm:mt-6">
          <p className="text-sm font-medium leading-snug text-white/90 sm:text-base">
            Transformez vos objectifs en résultats avec MedSim
          </p>
          <h1
            id="patient-services-heading"
            className="mt-2 text-[28px] font-bold leading-tight tracking-tight text-white sm:mt-3 sm:text-[36px]"
          >
            Une nouvelle façon de vivre les soins de santé
          </h1>
        </div>

        <ul className="relative z-10 mt-8 grid gap-4 sm:mt-10 sm:grid-cols-3 sm:gap-5">
          {PATIENT_SERVICE_CARDS.map((service) => {
            const isLocalImage = service.image.startsWith("/");

            return (
              <li key={service.id}>
                <Link
                  href={service.href}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <div
                    className={`relative aspect-[4/3] w-full overflow-hidden ${service.panelClass}`}
                  >
                    <Image
                      src={service.image}
                      alt={service.imageAlt}
                      fill
                      unoptimized={isLocalImage}
                      className="object-cover object-center transition duration-300 group-hover:scale-[1.03]"
                      sizes="(max-width: 640px) 90vw, 320px"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
                    <p className="text-[16px] font-bold text-slate-900">{service.title}</p>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition group-hover:bg-[var(--teal)] group-hover:text-white">
                      <ArrowIcon />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

