"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

type Props = {
  /** Destination si `direct` ou historique insuffisant. */
  fallbackHref: string;
  /**
   * true : toujours aller à `fallbackHref` (parcours onboarding).
   * false : essayer `router.back()` d'abord (admin).
   */
  direct?: boolean;
  className?: string;
  children?: ReactNode;
};

export function PreviousPageButton({
  fallbackHref,
  direct = false,
  className = "text-sm font-medium text-slate-600 transition hover:text-[var(--teal-900)]",
  children = "← Retour",
}: Props) {
  const router = useRouter();

  function handleClick() {
    if (!direct && typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
