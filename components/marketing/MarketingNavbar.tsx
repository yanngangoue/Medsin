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

      {menuOpen ? (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMenuOpen(false)}
            aria-label="Fermer le menu"
          />
          <div className="absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <MarketingLogo />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="text-2xl text-gray-500"
                aria-label="Fermer"
              >
                ×
              </button>
            </div>
            <nav className="mt-10 flex flex-col gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-lg font-medium text-[#1A1A2E]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-3 pt-8">
              <Link
                href="/auth/connexion"
                onClick={() => setMenuOpen(false)}
                className="text-center text-sm text-gray-600"
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
      ) : null}
    </>
  );
}
