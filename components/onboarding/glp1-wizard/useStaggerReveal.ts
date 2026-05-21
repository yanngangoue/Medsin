"use client";

import { useEffect, useState } from "react";

/** Révèle les éléments un par un, très rapidement (style MEDVi page B). */
export function useStaggerReveal(
  itemCount: number,
  delayMs = 48,
  active = true,
  resetKey?: string | number,
) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    setVisibleCount(0);
  }, [active, itemCount, resetKey]);

  useEffect(() => {
    if (!active || visibleCount >= itemCount) return;
    const id = window.setTimeout(() => {
      setVisibleCount((c) => c + 1);
    }, delayMs);
    return () => window.clearTimeout(id);
  }, [active, visibleCount, itemCount, delayMs]);

  return visibleCount;
}

export function isStaggerVisible(index: number, visibleCount: number) {
  return index < visibleCount;
}
