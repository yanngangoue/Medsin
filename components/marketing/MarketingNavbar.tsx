"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MarketingLogo } from "@/components/marketing/MarketingLogo";

const NAV_LINKS = [
  { href: "#medicaments", label: "Médicaments" },
  { href: "#comment-ca-marche", label: "Comment ça marche" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
];

export function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll + focus close button when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) setTimeout(() => closeRef.current?.focus(), 50);
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* ── Header ── */}
      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? "border-gray-100/80 bg-white/90 shadow-sm backdrop-blur-xl"
            : "border-transparent bg-white/70 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <MarketingLogo />

          <div className="flex items-center gap-3">
            <Link
              href="/eligibilite"
              className="rounded-full bg-[#1D4D3A] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Commencer
            </Link>

            {/* Hamburger — visible sur TOUS les écrans */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={open}
              aria-controls="nav-sidebar"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden>
                <path
                  fillRule="evenodd"
                  d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 5A.75.75 0 012.75 9h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 9.75zm0 5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── Sidebar overlay ── */}
      <div
        id="nav-sidebar"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
        className={`fixed inset-0 z-[60] transition-all duration-300 ease-in-out ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* Fond semi-transparent */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />

        {/* Panneau latéral — slide depuis la droite */}
        <aside
          className={`absolute right-0 top-0 flex h-full w-80 max-w-full flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* En-tête du panneau */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
            <MarketingLogo />
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer le menu"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:bg-gray-50"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden>
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>

          {/* Liens de navigation */}
          <nav className="flex flex-col px-2 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-3.5 text-base font-medium text-[#1A1A2E] transition hover:bg-gray-50"
              >
                {link.label}
              </Link>
            ))}

            <div className="my-3 border-t border-gray-100" />

            <Link
              href="/auth/connexion"
              onClick={() => setOpen(false)}
              className="rounded-lg px-4 py-3.5 text-base font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Connexion
            </Link>
          </nav>

          {/* CTA en bas du panneau */}
          <div className="mt-auto border-t border-gray-100 px-6 py-6">
            <Link
              href="/eligibilite"
              onClick={() => setOpen(false)}
              className="block rounded-full bg-[#1D4D3A] px-6 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
            >
              Créer mon compte
            </Link>
            <p className="mt-3 text-center text-xs text-gray-400">
              Programme GLP-1 · 179 $/mois
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
