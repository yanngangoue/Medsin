"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MedsimLogo } from "@/components/MedsimLogo";
import { Button } from "@/components/ui/Button";

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
      className={`sticky top-0 z-50 bg-white transition-[box-shadow,border-color] ${
        scrolled ? "border-b border-slate-200/90 shadow-sm shadow-slate-900/[0.06]" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="min-w-0 shrink">
          <MedsimLogo />
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <Link href="/connexion" className="sm:hidden">
            <Button variant="outline" className="px-[14px] py-[6px] text-[13px]">
              Connexion
            </Button>
          </Link>
          <div className="hidden items-center gap-2 sm:flex">
            <Link href="/connexion">
              <Button variant="ghost" className="!text-slate-700">
                Connexion
              </Button>
            </Link>
            <Link href="/onboarding/inscription">
              <Button className="shadow-md shadow-teal-900/10">Créer un compte</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
