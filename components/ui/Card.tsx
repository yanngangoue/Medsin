import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm shadow-slate-900/5 ${className}`}
    >
      {children}
    </div>
  );
}
