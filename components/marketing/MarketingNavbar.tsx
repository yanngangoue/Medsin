"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MarketingLogo } from "@/components/marketing/MarketingLogo";

const NAV_LINKS = [
  { href: "#medicaments", label: "Médicaments" },
  { href: "#comment-ca-marche", label: "Comment ça marche" },
  { href: "#calculateur-imc", label: "IMC" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
];

export function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? "border-gray-100/80 bg-white/85 shadow-sm backdrop-blur-xl"
            : "border-transparent bg-white/70 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <MarketingLogo />

          <nav className="hidden items-center gap-8 md:flex" aria-label="Navigation principale">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-600 transition-colors hover:text-[#1A1A2E]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-5 md:flex">
            <Link
              href="/auth/connexion"
              className="text-sm text-gray-600 transition-colors hover:text-[#1A1A2E]"
            >
              Connexion
            </Link>
            <Link
              href="/eligibilite"
              className="rounded-full bg-[#1D4D3A] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Commencer
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 md:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <span className="text-lg" aria-hidden>
              ☰
            </span>
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-x-0 top-0 z-[60] md:hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!menuOpen}
      >
        {/* Backdrop */}
        <button
          type="button"
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${menuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMenuOpen(false)}
          aria-label="Fermer le menu"
          tabIndex={menuOpen ? 0 : -1}
        />
        {/* Panneau slide-down */}
        <div
          className={`relative border-b border-gray-100 bg-white shadow-xl transition-transform duration-300 ease-in-out ${
            menuOpen ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="flex items-center justify-between px-5 py-4">
            <MarketingLogo />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500"
              aria-label="Fermer"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-col border-t border-gray-100 px-5 pb-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-gray-50 py-4 text-base font-medium text-[#1A1A2E] last:border-0"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-3 px-5 pb-6 pt-2">
            <Link
              href="/connexion"
              onClick={() => setMenuOpen(false)}
              className="rounded-full border border-gray-200 px-6 py-3 text-center text-sm font-medium text-gray-700"
            >
              Connexion
            </Link>
            <Link
              href="/eligibilite"
              onClick={() => setMenuOpen(false)}
              className="rounded-full bg-[#1D4D3A] px-6 py-3 text-center text-sm font-semibold text-white"
            >
              Commencer
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
