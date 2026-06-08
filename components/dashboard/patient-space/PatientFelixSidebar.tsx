"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { MedsimLogo } from "@/components/MedsimLogo";
import { SignOutButton } from "@/components/role-portal/SignOutButton";
import { useUnreadChatCount } from "@/lib/patient/use-unread-chat";
import { PATIENT_DASHBOARD_ROUTES } from "@/lib/patient/dashboard-routes";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  badge?: "anne" | "ips";
  exact?: boolean;
};

const NAV: NavItem[] = [
  { href: PATIENT_DASHBOARD_ROUTES.hub, label: "Tableau de bord", icon: "🏠", exact: true },
  { href: PATIENT_DASHBOARD_ROUTES.poids, label: "Mon suivi poids", icon: "⚖️" },
  { href: "/dashboard/patient/coach-ia", label: "Anne (coach IA)", icon: "💬", badge: "anne" },
  { href: PATIENT_DASHBOARD_ROUTES.ordonnance, label: "Mon ordonnance", icon: "💊" },
  { href: PATIENT_DASHBOARD_ROUTES.clavardage, label: "Mon IPS", icon: "🗨️", badge: "ips" },
  { href: PATIENT_DASHBOARD_ROUTES.confidentialite, label: "Confidentialité", icon: "🔒" },
];

type Props = {
  prenom?: string;
  anneHasNewMessage?: boolean;
  onNavigate?: () => void;
};

function isActive(pathname: string, searchParams: URLSearchParams, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  if (item.href.includes("coach-ia")) {
    return (
      pathname === "/dashboard/patient/coach-ia" ||
      pathname === "/dashboard/patient/coach" ||
      (pathname === "/dashboard/patient/poids" && searchParams.get("tab") === "coach")
    );
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function PatientFelixSidebar({ prenom = "", anneHasNewMessage = false, onNavigate }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const unreadIps = useUnreadChatCount();
  const initial = prenom.trim().charAt(0).toUpperCase() || "P";

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200/80 px-5 py-5">
        <Link href="/" className="inline-flex items-center" onClick={onNavigate} aria-label="MedSim">
          <MedsimLogo />
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4" aria-label="Navigation patient">
        {NAV.map((item) => {
          const active = isActive(pathname, searchParams, item);
          const showAnneBadge = item.badge === "anne" && anneHasNewMessage;
          const showIpsBadge = item.badge === "ips" && unreadIps > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[#1D4D3A]/10 text-[#1D4D3A]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className="text-base" aria-hidden>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {showAnneBadge ? (
                <span className="h-2 w-2 shrink-0 rounded-full bg-[#3EBD93]" aria-label="Nouveau message" />
              ) : null}
              {showIpsBadge ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {unreadIps}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200/80 px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1D4D3A]/10 text-sm font-bold text-[#1D4D3A]">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{prenom || "Patient"}</p>
            <SignOutButton />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200/80 p-4">
        <a
          href="tel:811"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
        >
          🚨 Urgence : 811
        </a>
      </div>
    </div>
  );
}
