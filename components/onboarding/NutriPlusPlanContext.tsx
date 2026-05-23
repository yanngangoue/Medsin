"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const NUTRI_COMMENCER_ANCHOR_ID = "nutri-commencer-cta";

type NutriPlusPlanContextValue = {
  isPlanOpen: boolean;
  openPlan: () => void;
  closePlan: () => void;
};

const NutriPlusPlanContext = createContext<NutriPlusPlanContextValue | null>(null);

function scrollToCommencerCta() {
  window.setTimeout(() => {
    document
      .getElementById(NUTRI_COMMENCER_ANCHOR_ID)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 80);
}

export function NutriPlusPlanProvider({ children }: { children: ReactNode }) {
  const [isPlanOpen, setIsPlanOpen] = useState(false);

  const openPlan = useCallback(() => {
    setIsPlanOpen(true);
    window.setTimeout(() => {
      document
        .getElementById("mon-plan-nutri")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }, []);

  const closePlan = useCallback(() => {
    setIsPlanOpen(false);
    scrollToCommencerCta();
  }, []);

  const value = useMemo(
    () => ({ isPlanOpen, openPlan, closePlan }),
    [isPlanOpen, openPlan, closePlan],
  );

  return (
    <NutriPlusPlanContext.Provider value={value}>{children}</NutriPlusPlanContext.Provider>
  );
}

export function useNutriPlusPlan() {
  const ctx = useContext(NutriPlusPlanContext);
  if (!ctx) {
    throw new Error("useNutriPlusPlan must be used within NutriPlusPlanProvider");
  }
  return ctx;
}
