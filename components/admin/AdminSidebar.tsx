"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/role-portal/SignOutButton";

const NAV = [
  { href: "/admin/dashboard", label: "Tableau de bord", short: "Accueil", icon: "🏠" },
  { href: "/admin/patients", label: "Patients", short: "Patients", icon: "👥" },
  { href: "/admin/pharmacies", label: "Pharmacie", short: "Pharma", icon: "💊" },
  { href: "/admin/messages", label: "Messages", short: "Messages", icon: "💬" },
  { href: "/admin/settings", label: "Paramètres", short: "Réglages", icon: "⚙️" },
] as const;

function NavLink({
  href,
  label,
  short,
  icon,
  mobile,
}: {
  href: string;
  label: string;
  short: string;
  icon: string;
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-[#16a34a] text-white"
          : "text-slate-700 hover:bg-slate-100"
      } ${mobile ? "flex-col gap-0.5 px-2 py-1.5 text-[10px]" : ""}`}
    >
      <span className={mobile ? "text-lg" : "text-base"} aria-hidden>
        {icon}
      </span>
      <span className={mobile ? "leading-tight" : ""}>{mobile ? short : label}</span>
    </Link>
  );
}

export function AdminSidebar() {
  return (
    <>
      <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="border-b border-slate-100 px-4 py-5">
          <Link href="/admin/dashboard" className="text-lg font-bold text-[#16a34a]">
            MedSim
          </Link>
          <p className="mt-0.5 text-xs text-slate-500">Back-office clinique</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>
        <div className="border-t border-slate-100 p-3">
          <SignOutButton
            callbackUrl="/auth/connexion"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          />
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-slate-200 bg-white px-2 py-2 md:hidden">
        {NAV.map((item) => (
          <NavLink key={item.href} {...item} mobile />
        ))}
      </nav>
    </>
  );
}
