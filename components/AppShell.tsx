"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { MedsimLogo } from "@/components/MedsimLogo";
import { signOut } from "next-auth/react";

export function AppShell({
  children,
  showNav = true,
}: {
  children: ReactNode;
  showNav?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {showNav ? (
        <header className="border-b border-[var(--border)] bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/">
              <MedsimLogo />
            </Link>
            <nav className="flex items-center gap-3 text-sm">
              <Link href="/" className="text-slate-600 hover:text-teal-700">
                Tableau de bord
              </Link>
              <Link href="/appointments" className="text-slate-600 hover:text-teal-700">
                Consultations
              </Link>
              <button
                type="button"
                className="rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100"
                onClick={() => {
                  void signOut({ callbackUrl: "/" });
                }}
              >
                Déconnexion
              </button>
            </nav>
          </div>
        </header>
      ) : null}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
