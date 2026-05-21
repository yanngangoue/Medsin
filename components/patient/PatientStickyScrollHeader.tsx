"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MedsimLogo } from "@/components/MedsimLogo";
import { PatientNav } from "@/components/patient/PatientNav";
import { PUBLIC_CATALOG_HOME } from "@/lib/public-catalog";
import { PatientHubNavMenu } from "@/components/patient/PatientHubNavMenu";
import { useSession } from "next-auth/react";

const HUB_ID = "patient-services-hub";
const SCROLL_DELTA = 6;

type Props = {
  showAuthLinks?: boolean;
  connectedHasGlp1?: boolean;
};

export function PatientStickyScrollHeader({
  showAuthLinks = false,
  connectedHasGlp1 = false,
}: Props) {
  const { data: session } = useSession();
  const isPatient = session?.user?.role === "PATIENT";
  const [visible, setVisible] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const isInGreenZone = () => {
      const hub = document.getElementById(HUB_ID);
      if (!hub) return window.scrollY < 80;
      const rect = hub.getBoundingClientRect();
      return rect.bottom > 48 && rect.top >= -40;
    };

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;
      lastScrollY.current = y;

      if (isInGreenZone()) {
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

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <header className="fixed inset-x-0 top-0 z-[60] border-b border-slate-200/90 bg-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <Link
          href={PUBLIC_CATALOG_HOME}
          className="rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)]"
          aria-label="Accueil — catalogue"
        >
          <MedsimLogo className="text-xl sm:text-2xl" />
        </Link>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          {isPatient ? (
            <div className="min-w-0 flex-1">
              <PatientNav
                hasGlp1Dossier={connectedHasGlp1}
                variant="light"
                showLogo={false}
                showSignOut={false}
              />
            </div>
          ) : (
            <>
              <PatientHubNavMenu showAuthLinks={showAuthLinks} variant="onLight" />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
