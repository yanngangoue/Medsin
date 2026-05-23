"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { useSession } from "next-auth/react";
import { SignOutButton } from "@/components/role-portal/SignOutButton";
import { PartNavAccueilLink } from "@/components/patient/PartNavAccueilLink";
import { GLP1_PATIENT_DASHBOARD_PATH } from "@/lib/patient/glp1-flow-routes";
import { PUBLIC_CATALOG_HOME } from "@/lib/public-catalog";

export type OnboardingNavLink = {
  href: string;
  label: string;
};

type Props = {
  loginHref: string;
  signupHref: string;
  signupLabel?: string;
  navLinks: readonly OnboardingNavLink[];
  textClass?: string;
  accentHoverClass?: string;
};

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function OnboardingLandingHeaderMenu({
  loginHref,
  signupHref,
  signupLabel = "Inscrivez-vous",
  navLinks,
  textClass = "text-[#1A2E24] hover:opacity-80",
  accentHoverClass = "hover:text-[#1D9E75]",
}: Props) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isPatient = session?.user?.role === "PATIENT";
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (status === "loading") {
    return <span className="h-10 w-10 shrink-0" aria-hidden />;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-3 sm:gap-4">
        <Link href={loginHref} className={`text-sm font-medium ${textClass}`}>
          Se connecter
        </Link>
        <Link
          href={signupHref}
          className="rounded-md bg-[var(--teal-900)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--teal)]"
        >
          {signupLabel}
        </Link>
      </div>
    );
  }

  return (
    <div className="relative flex shrink-0 items-center">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Fermer le menu" : "Menu"}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-10 w-10 items-center justify-center rounded-lg text-[#1A2E24] hover:bg-black/5 ${accentHoverClass}`}
      >
        <MenuIcon />
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Fermer le menu"
            className="fixed inset-0 z-[70] bg-black/20"
            onClick={() => setOpen(false)}
          />
          <nav
            id={panelId}
            className="absolute right-0 top-full z-[80] mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl ring-1 ring-black/5"
          >
            <div className="border-b border-slate-100 px-4 py-2.5">
              <PartNavAccueilLink
                onNavigate={() => setOpen(false)}
                className="text-sm font-semibold text-[#1D9E75] hover:text-[var(--teal-900)]"
              />
            </div>
            <ul>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            {isPatient ? (
              <div className="border-t border-slate-100 pt-1">
                <Link
                  href={GLP1_PATIENT_DASHBOARD_PATH}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-sm font-semibold text-[#1D9E75] hover:bg-slate-50"
                >
                  Mon espace patient
                </Link>
              </div>
            ) : null}
            <div className="border-t border-slate-100 px-4 py-3">
              <SignOutButton
                callbackUrl={PUBLIC_CATALOG_HOME}
                className="w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              />
            </div>
          </nav>
        </>
      ) : null}
    </div>
  );
}
