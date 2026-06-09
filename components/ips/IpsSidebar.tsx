"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MedsimLogo } from "@/components/MedsimLogo";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  badgeKey?: "queue" | "chat";
  exact?: boolean;
};

const NAV: NavItem[] = [
  { href: "/dashboard/ips", label: "File d'attente", icon: "📋", badgeKey: "queue", exact: true },
  { href: "/dashboard/ips/patients", label: "Mes patients", icon: "👥" },
  { href: "/dashboard/ips/clavardage", label: "Clavardage", icon: "💬", badgeKey: "chat" },
  { href: "/dashboard/ips/rapports", label: "Rapports Anne", icon: "📊" },
  { href: "/dashboard/ips/parametres", label: "Paramètres", icon: "⚙️" },
];

type Stats = {
  queuePending: number;
  unreadChat: number;
};

type Props = {
  stats?: Stats;
  onNavigate?: () => void;
};

export function IpsSidebar({ stats, onNavigate }: Props) {
  const pathname = usePathname();
  const [localStats, setLocalStats] = useState<Stats>({ queuePending: 0, unreadChat: 0 });

  useEffect(() => {
    if (stats) {
      setLocalStats(stats);
      return;
    }
    void fetch("/api/ips/dashboard")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { stats?: Stats } | null) => {
        if (data?.stats) setLocalStats(data.stats);
      })
      .catch(() => undefined);
  }, [stats]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200/80 px-5 py-5">
        <Link href="/dashboard/ips" className="inline-flex flex-col gap-1" onClick={onNavigate} aria-label="MedSim">
          <MedsimLogo />
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#3EBD93]">
            Espace IPS
          </p>
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4" aria-label="Navigation IPS">
        {NAV.map((item) => {
          const exact = item.exact === true;
          const active = exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          let badge: number | null = null;
          if (item.badgeKey === "queue" && localStats.queuePending > 0) {
            badge = localStats.queuePending;
          }
          if (item.badgeKey === "chat" && localStats.unreadChat > 0) {
            badge = localStats.unreadChat;
          }

          let label = item.label;
          if (item.badgeKey === "queue" && badge != null) {
            label = `File d'attente (${badge} dossier${badge > 1 ? "s" : ""})`;
          }
          if (item.badgeKey === "chat" && badge != null) {
            label = `Clavardage (${badge} non lu${badge > 1 ? "s" : ""})`;
          }

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
              <span className="flex-1 leading-snug">{label}</span>
              {badge != null && item.badgeKey === "chat" ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
