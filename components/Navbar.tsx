"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MedsimLogo } from "@/components/MedsimLogo";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-white transition-shadow ${
        scrolled ? "border-[var(--border-soft)] shadow-sm" : "border-[var(--border-soft)]"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="min-w-0 shrink">
          <MedsimLogo />
        </Link>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/patient"
            className="inline-flex h-10 items-center justify-center rounded-[10px] px-3 text-[14px] font-medium text-[var(--gray-900)] transition hover:bg-[var(--teal-light)] hover:opacity-95 sm:px-4"
          >
            Nos services
          </Link>
          <Link
            href="/auth/inscription"
            aria-label="Commencer votre parcours"
            className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-[10px] bg-[var(--teal)] px-3 text-[12px] font-bold text-white shadow-sm transition hover:opacity-95 hover:[transform:scale(1.02)] active:scale-[0.99] sm:px-4 sm:text-[14px]"
          >
            Commencer
          </Link>
        </div>
      </div>
    </header>
  );
}
