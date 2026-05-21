"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GLP1_EVALUATION_PATH,
  GLP1_PATIENT_DASHBOARD_PATH,
  GLP1_PATIENT_DOSSIER_PATH,
} from "@/lib/patient/glp1-flow-routes";
import { PUBLIC_CATALOG_HOME } from "@/lib/public-catalog";

type Crumb = { label: string; href?: string };

function buildCrumbs(pathname: string): Crumb[] {
  const crumbs: Crumb[] = [{ label: "Accueil", href: PUBLIC_CATALOG_HOME }];

  if (pathname.startsWith("/onboarding/gestion-poids/evaluation")) {
    crumbs.push({ label: "Évaluation GLP-1" });
    return crumbs;
  }
  if (pathname.startsWith("/onboarding/confirmation")) {
    crumbs.push(
      { label: "Évaluation", href: GLP1_EVALUATION_PATH },
      { label: "Confirmation" },
    );
    return crumbs;
  }
  if (pathname === GLP1_PATIENT_DOSSIER_PATH) {
    crumbs.push(
      { label: "Mon espace", href: GLP1_PATIENT_DASHBOARD_PATH },
      { label: "Mon dossier GLP-1" },
    );
    return crumbs;
  }
  if (pathname.startsWith("/dashboard/patient")) {
    crumbs.push({ label: "Mon espace" });
    return crumbs;
  }

  return crumbs;
}

export function Glp1FlowBreadcrumb() {
  const pathname = usePathname();
  const crumbs = buildCrumbs(pathname);

  if (crumbs.length <= 1) return null;

  return (
    <nav
      aria-label="Fil d'Ariane"
      className="border-b border-slate-100 bg-white px-4 py-2.5 text-xs text-slate-500 sm:px-6"
    >
      <ol className="mx-auto flex max-w-lg flex-wrap items-center gap-1">
        {crumbs.map((crumb, i) => (
          <li key={`${crumb.label}-${i}`} className="flex items-center gap-1">
            {i > 0 ? (
              <span className="text-slate-300" aria-hidden>
                /
              </span>
            ) : null}
            {crumb.href ? (
              <Link href={crumb.href} className="font-medium text-[#1D9E75] hover:underline">
                {crumb.label}
              </Link>
            ) : (
              <span className="font-medium text-slate-700">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
