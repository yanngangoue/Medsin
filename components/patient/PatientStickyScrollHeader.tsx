"use client";

import { useEffect, useRef, useState } from "react";
import { PatientCatalogFelixNav } from "@/components/patient/PatientCatalogFelixNav";

const HERO_ID = "patient-hero-banner";
const SCROLL_DELTA = 4;

type Props = {
  showAuthLinks?: boolean;
  prenom?: string;
  isConnected?: boolean;
};

export function PatientStickyScrollHeader({
  showAuthLinks = false,
  prenom,
  isConnected = false,
}: Props) {
  const [visible, setVisible] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const isHeroVisible = () => {
      const hero = document.getElementById(HERO_ID);
      if (!hero) return window.scrollY < 120;
      const rect = hero.getBoundingClientRect();
      return rect.bottom > 72;
    };

    const updateVisibility = (delta: number) => {
      if (isHeroVisible()) {
        setVisible(false);
        return;
      }

      if (delta < -SCROLL_DELTA) {
        setVisible(true);
        return;
      }

      if (delta > SCROLL_DELTA) {
        setVisible(false);
      }
    };

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;
      lastScrollY.current = y;
      updateVisibility(delta);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      aria-hidden={!visible}
      className={`fixed inset-x-0 top-0 z-[60] px-3 pt-2 transition-transform duration-300 ease-out sm:px-5 md:px-6 ${
        visible ? "translate-y-0" : "pointer-events-none -translate-y-full"
      }`}
    >
      <PatientCatalogFelixNav
        prenom={prenom}
        isConnected={isConnected}
        showAuthLinks={showAuthLinks}
        embedded
      />
    </header>
  );
}
