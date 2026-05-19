"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { PATIENT_SERVICE_CARDS } from "@/lib/patient/services";

type Props = {
  showAuthLinks?: boolean;
  /** Bouton ☰ : blanc sur bandeau vert, sombre sur bandeau blanc */
  variant?: "onDark" | "onLight";
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

export function PatientHubNavMenu({ showAuthLinks = false, variant = "onDark" }: Props) {
  const isLight = variant === "onLight";
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

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu des services"}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-10 w-10 items-center justify-center rounded-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
          isLight
            ? "text-slate-800 hover:bg-slate-100 focus-visible:outline-[var(--teal)]"
            : "text-white hover:bg-white/10 focus-visible:outline-white"
        }`}
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
            className={`absolute right-0 top-full z-[80] mt-2 w-56 overflow-hidden rounded-xl border bg-white py-1 shadow-xl ring-1 ring-black/5 ${
              isLight ? "border-slate-200" : "border-white/10"
            }`}
          >
            <p className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Nos services
            </p>
            <ul>
              {PATIENT_SERVICE_CARDS.map((service) => (
                <li key={service.id}>
                  <Link
                    href={service.href}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-1 border-t border-slate-100 pt-1">
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
              >
                Contact
              </Link>
            </div>
            {showAuthLinks ? (
              <div className="mt-1 border-t border-slate-100 pt-1">
                <Link
                  href="/connexion?callbackUrl=/"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Connexion
                </Link>
                <Link
                  href="/onboarding/inscription"
                  onClick={() => setOpen(false)}
                  className="mx-3 mb-2 mt-1 block rounded-lg bg-[var(--teal-900)] px-3 py-2 text-center text-sm font-semibold text-white hover:bg-[var(--teal)]"
                >
                  Commencer
                </Link>
              </div>
            ) : null}
          </nav>
        </>
      ) : null}
    </div>
  );
}
