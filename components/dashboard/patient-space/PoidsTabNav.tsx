"use client";

import Link from "next/link";
import { POIDS_TABS, type PoidsTab, poidsTabHref } from "@/lib/patient/dashboard-routes";

type Props = {
  active: PoidsTab;
};

export function PoidsTabNav({ active }: Props) {
  return (
    <nav
      className="flex flex-col gap-2 sm:flex-row sm:gap-1"
      aria-label="Sections du suivi poids"
    >
      {POIDS_TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Link
            key={tab.id}
            href={poidsTabHref(tab.id)}
            className={`flex-1 rounded-xl px-4 py-3 text-center text-sm font-semibold transition ${
              isActive
                ? "bg-[#1D4D3A] text-white shadow-sm"
                : "bg-white text-slate-700 ring-1 ring-slate-200/80 hover:ring-[#1D4D3A]/25"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
