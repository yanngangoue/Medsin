"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MedsimLogo } from "@/components/MedsimLogo";
import { SignOutButton } from "@/components/role-portal/SignOutButton";

const NAV = [
  { href: "/admin/dashboard", label: "Tableau de bord", short: "Accueil" },
  { href: "/admin/patients", label: "Patients", short: "Patients" },
  { href: "/admin/equipe", label: "Équipe clinique", short: "Équipe" },
  { href: "/admin/ips", label: "IPS", short: "IPS" },
  { href: "/admin/pharmacies", label: "Pharmacie", short: "Pharma" },
  { href: "/admin/messages", label: "Messages", short: "Msgs" },
  { href: "/admin/teleconsultations", label: "Téléconsultations", short: "Téléc." },
  { href: "/admin/settings", label: "Paramètres", short: "Réglages" },
] as const;

function NavLink({
  href,
  label,
  short,
  mobile,
}: {
  href: string;
  label: string;
  short: string;
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
      } ${mobile ? "min-w-[4.25rem] shrink-0 flex-col px-2 py-1.5 text-[10px]" : ""}`}
    >
      <span className={`font-semibold ${mobile ? "text-xs" : "text-sm"}`}>
        {mobile ? short : label}
      </span>
    </Link>
  );
}

export function AdminSidebar({ role }: { role?: string }) {
  const nav = role === "ADMIN" ? NAV : NAV.filter((item) => item.href !== "/admin/equipe");
  return (
    <>
      <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="border-b border-slate-100 px-4 py-5">
          <Link href="/admin/dashboard" aria-label="Anne-sante — administration">
            <MedsimLogo />
          </Link>
          <p className="mt-0.5 text-xs text-slate-500">Espace d&apos;administration clinique</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {nav.map((item) => (
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

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex gap-1 overflow-x-auto border-t border-slate-200 bg-white px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden">
        {nav.map((item) => (
          <NavLink key={item.href} {...item} mobile />
        ))}
      </nav>
    </>
  );
}
