import type { ReactNode } from "react";

type Props = {
  label: string;
  value: number | string;
  icon?: ReactNode;
  accent?: "green" | "amber" | "slate";
};

export function StatCard({ label, value, icon, accent = "green" }: Props) {
  const ring =
    accent === "amber"
      ? "border-amber-200"
      : accent === "slate"
        ? "border-slate-200"
        : "border-emerald-100";

  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm ${ring}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        {icon ? <span className="text-2xl text-[#16a34a]">{icon}</span> : null}
      </div>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
