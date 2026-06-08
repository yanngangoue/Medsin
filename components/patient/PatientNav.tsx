"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { SignOutButton } from "@/components/role-portal/SignOutButton";
import { MedsimLogo } from "@/components/MedsimLogo";
import { buildPatientNavItems, isPatientNavActive } from "@/lib/patient/patient-nav";
import { usePatientNotifications } from "@/lib/patient/use-patient-notifications";
import { PUBLIC_CATALOG_HOME } from "@/lib/public-catalog";
type Props = {
  hasGlp1Dossier: boolean;
  /** Bandeau sombre (accueil) ou clair (espace / GLP-1) */
  variant?: "light" | "dark";
  showLogo?: boolean;
  showSignOut?: boolean;
};

function NavBadge({ count, pulse }: { count: number; pulse?: boolean }) {
  if (count <= 0 && !pulse) return null;
  return (
    <span
      className={`ml-1 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold ${
        pulse ? "bg-amber-400 text-amber-950" : "bg-red-500 text-white"
      }`}
    >
      {count > 0 ? (count > 9 ? "9+" : count) : "•"}
    </span>
  );
}

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

export function PatientNav({
  hasGlp1Dossier,
  variant = "light",
  showLogo = true,
  showSignOut = true,
}: Props) {
  const pathname = usePathname();
  const items = buildPatientNavItems(hasGlp1Dossier);
  const { unreadMessages, upcomingVideo, checkInPending } = usePatientNotifications();
  const [menuOpen, setMenuOpen] = useState(false);
  const panelId = useId();
  const isDark = variant === "dark";

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const linkClass = (active: boolean) =>
    isDark
      ? `text-sm font-medium transition ${
          active ? "text-white" : "text-white/85 hover:text-white"
        }`
      : `text-sm font-medium transition ${
          active ? "text-[#1D9E75]" : "text-slate-600 hover:text-[#1D9E75]"
        }`;

  const mobileLinkClass = (active: boolean) =>
    `block rounded-lg px-4 py-3 text-sm font-semibold ${
      active ? "bg-[#F0FBF7] text-[#1D9E75]" : "text-slate-800 hover:bg-slate-50"
    }`;

  return (
    <div
      className={`flex w-full items-center gap-3 ${showLogo ? "justify-between" : "justify-end"}`}
    >
      {showLogo ? (
        <Link
          href={PUBLIC_CATALOG_HOME}
          className="shrink-0 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)]"
          aria-label="MedSim — accueil"
        >
          <MedsimLogo variant={isDark ? "onDark" : "default"} />
        </Link>
      ) : (
        <span className="w-8 shrink-0 sm:w-24" aria-hidden />
      )}

      <nav
        className="hidden items-center gap-5 md:flex"
        aria-label="Navigation patient"
      >
        {items.map((item) => {
          const active = isPatientNavActive(pathname, item);
          const badge =
            item.id === "contact" ? (
              <>
                {unreadMessages > 0 ? <NavBadge count={unreadMessages} /> : null}
                {upcomingVideo ? <NavBadge count={0} pulse /> : null}
              </>
            ) : item.id === "poids" && checkInPending ? (
              <NavBadge count={0} pulse />
            ) : null;
          return (
            <Link key={item.id} href={item.href} className={linkClass(active)}>
              {item.label}
              {badge}
            </Link>
          );
        })}
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        {showSignOut ? (
          <SignOutButton
            callbackUrl={PUBLIC_CATALOG_HOME}
            className={
              isDark
                ? "hidden rounded-lg border border-white/30 px-3 py-1.5 text-xs font-medium text-white/90 hover:bg-white/10 sm:inline-flex"
                : "hidden rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 sm:inline-flex"
            }
          />
        ) : null}

        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls={panelId}
          aria-label={menuOpen ? "Fermer le menu" : "Menu navigation"}
          onClick={() => setMenuOpen((v) => !v)}
          className={
            isDark
              ? "flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10 md:hidden"
              : "flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 md:hidden"
          }
        >
          <MenuIcon />
        </button>
      </div>

      {menuOpen ? (
        <>
          <button
            type="button"
            aria-label="Fermer"
            className="fixed inset-0 z-[70] bg-black/30 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            id={panelId}
            className="fixed inset-x-4 top-[4.5rem] z-[80] overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl md:hidden"
            aria-label="Menu mobile"
          >
            {items.map((item) => {
              const active = isPatientNavActive(pathname, item);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={mobileLinkClass(active)}
                >
                  <span className="flex items-center justify-between">
                    {item.label}
                    {item.id === "contact" && unreadMessages > 0 ? (
                      <NavBadge count={unreadMessages} />
                    ) : null}
                    {item.id === "contact" && upcomingVideo ? (
                      <span className="text-xs font-medium text-amber-700">Visio ouverte</span>
                    ) : null}
                    {item.id === "poids" && checkInPending ? (
                      <span className="text-xs font-medium text-amber-700">Check-in en attente</span>
                    ) : null}
                  </span>
                </Link>
              );
            })}
            <div className="mt-2 border-t border-slate-100 px-4 py-3">
              <SignOutButton
                callbackUrl={PUBLIC_CATALOG_HOME}
                className="w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600"
              />
            </div>
          </nav>
        </>
      ) : null}
    </div>
  );
}

/** Barre secondaire sous l’en-tête GLP-1 (fil + nav). */
export function PatientNavSubBar({ hasGlp1Dossier }: { hasGlp1Dossier: boolean }) {
  const pathname = usePathname();
  const items = buildPatientNavItems(hasGlp1Dossier);
  const { unreadMessages, upcomingVideo, checkInPending } = usePatientNotifications();

  return (
    <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-2 sm:px-6">
      <div className="mx-auto flex max-w-lg flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {items.map((item) => {
          const active = isPatientNavActive(pathname, item);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`text-[11px] font-semibold uppercase tracking-wide ${
                active ? "text-[#1D9E75]" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {item.label}
              {item.id === "contact" && unreadMessages > 0 ? (
                <NavBadge count={unreadMessages} />
              ) : null}
              {item.id === "contact" && upcomingVideo ? (
                <NavBadge count={0} pulse />
              ) : null}
              {item.id === "poids" && checkInPending ? (
                <NavBadge count={0} pulse />
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
