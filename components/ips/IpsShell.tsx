"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Suspense, useState } from "react";
import { MedsimLogo } from "@/components/MedsimLogo";
import { IpsSidebar } from "@/components/ips/IpsSidebar";
import { SectionErrorBoundary } from "@/components/ui/SectionErrorBoundary";

type Stats = {
  queuePending: number;
  unreadChat: number;
};

type Props = {
  children: ReactNode;
  stats?: Stats;
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

export function IpsShell({ children, stats }: Props) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#FAFAF8]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200/80 bg-white lg:block">
        <Suspense fallback={<div className="h-full animate-pulse bg-slate-50" />}>
          <IpsSidebar stats={stats} />
        </Suspense>
      </aside>

      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Fermer le menu"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200/80 bg-white transition-transform lg:hidden ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <IpsSidebar stats={stats} onNavigate={() => setMobileNavOpen(false)} />
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200/70 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="rounded-lg border border-slate-200 p-2 text-slate-700"
            aria-label="Ouvrir le menu"
          >
            <MenuIcon />
          </button>
          <Link href="/dashboard/ips" aria-label="MedSim">
            <MedsimLogo />
          </Link>
        </header>
        <main className="flex-1">
          <SectionErrorBoundary title="Impossible d'afficher cette section de l'espace IPS.">
            {children}
          </SectionErrorBoundary>
        </main>
      </div>
    </div>
  );
}
