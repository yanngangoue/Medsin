"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MarketingLogo } from "@/components/marketing/MarketingLogo";
import { ELIGIBILITY_PATH, NAV_LINKS } from "@/lib/marketing/landing-content";

type Props = {
  isPatientSession?: boolean;
};

export function MarketingNavbar({ isPatientSession = false }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const startHref = ELIGIBILITY_PATH;

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
    <header
      className={`sticky top-0 z-50 border-b bg-white transition-shadow ${
        scrolled ? "border-gray-100 shadow-sm" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Link href="/" className="shrink-0" onClick={() => setMenuOpen(false)}>
          <MarketingLogo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="text-sm font-medium text-[#1A1A2E]/80 transition hover:text-[#1D4D3A]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/connexion"
            className="text-sm font-semibold text-[#1A1A2E] transition hover:text-[#1D4D3A]"
          >
            Connexion
          </Link>
          <Link
            href={startHref}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#3EBD93] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#35a882]"
          >
            Suis-je éligible ?
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-[#1A1A2E] md:hidden"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? (
            <span className="text-xl leading-none">×</span>
          ) : (
            <span className="flex flex-col gap-1.5" aria-hidden>
              <span className="block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-5 bg-current" />
            </span>
          )}
        </button>
      </div>

      {menuOpen ? (
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Navigation mobile">
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="rounded-lg px-3 py-3 text-sm font-medium text-[#1A1A2E] hover:bg-[#FAFAF8]"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/connexion"
              className="rounded-lg px-3 py-3 text-sm font-semibold text-[#1A1A2E] hover:bg-[#FAFAF8]"
              onClick={() => setMenuOpen(false)}
            >
              Connexion
            </Link>
            <Link
              href={startHref}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-[#3EBD93] px-5 text-sm font-semibold text-white"
              onClick={() => setMenuOpen(false)}
            >
              Suis-je éligible ?
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
