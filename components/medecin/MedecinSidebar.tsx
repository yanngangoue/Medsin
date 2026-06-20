"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MedsimLogo } from "@/components/MedsimLogo";
import { SignOutButton } from "@/components/role-portal/SignOutButton";

const NAV = [
  { href: "/medecin/file", label: "File de travail", short: "File", icon: "📋" },
  { href: "/medecin/patients", label: "Mes patients", short: "Patients", icon: "👥" },
  { href: "/medecin/messages", label: "Messagerie", short: "Messages", icon: "💬" },
  { href: "/medecin/agenda", label: "Rendez-vous", short: "Agenda", icon: "📅" },
  { href: "/medecin/ordonnances", label: "Ordonnances", short: "Ordonn.", icon: "📄" },
] as const;

export function MedecinSidebar({ urgentCount = 0 }: { urgentCount?: number }) {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="border-b border-slate-100 px-4 py-5">
          <Link href="/medecin/file" aria-label="Anne-sante — espace médecin">
            <MedsimLogo />
          </Link>
          <p className="mt-0.5 text-xs text-slate-500">Espace médecin</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                  active ? "bg-[#16a34a] text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
                {item.href === "/medecin/file" && urgentCount > 0 ? (
                  <span className="ml-auto rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                    {urgentCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-100 p-3">
          <SignOutButton
            callbackUrl="/auth/connexion"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          />
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-slate-200 bg-white px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-w-0 flex-1 flex-col items-center px-1 text-[10px] leading-tight ${
              pathname.startsWith(item.href) ? "text-[#16a34a]" : "text-slate-600"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="mt-0.5 max-w-full truncate text-center">{item.short}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
