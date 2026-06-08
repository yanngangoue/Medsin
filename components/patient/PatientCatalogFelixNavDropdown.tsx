"use client";

import Link from "next/link";
import { useState } from "react";
import type { CatalogFelixNavMenu } from "@/lib/patient/catalog-felix-nav";

function ChevronDown({ open }: { open?: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      className={`opacity-50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

type Props = {
  menu: CatalogFelixNavMenu;
};

export function PatientCatalogFelixNavDropdown({ menu }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        tabIndex={-1}
        onMouseEnter={() => setOpen(true)}
        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium transition-colors sm:px-2.5 ${
          open ? "bg-slate-100 text-slate-900" : "text-slate-700"
        }`}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={`felix-nav-${menu.id}`}
      >
        {menu.label}
        <ChevronDown open={open} />
      </button>

      <div
        id={`felix-nav-${menu.id}`}
        className={`absolute left-1/2 top-full z-50 w-[min(100vw-2rem,17rem)] -translate-x-1/2 pt-2 transition-[opacity,visibility] duration-150 ${
          open ? "visible opacity-100" : "pointer-events-none invisible opacity-0"
        }`}
        role="menu"
        aria-label={menu.label}
      >
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white py-1.5 shadow-xl ring-1 ring-black/5">
          <ul>
            {menu.items.map((item) => (
              <li key={`${menu.id}-${item.label}`} role="none">
                <Link
                  href={item.href}
                  role="menuitem"
                  className="block px-4 py-2.5 transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
                >
                  <span className="block text-sm font-medium text-slate-900">{item.label}</span>
                  {item.description ? (
                    <span className="mt-0.5 block text-xs leading-snug text-slate-500">
                      {item.description}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
