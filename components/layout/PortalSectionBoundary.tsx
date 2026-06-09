"use client";

import type { ReactNode } from "react";
import { SectionErrorBoundary } from "@/components/ui/SectionErrorBoundary";

type Props = {
  children: ReactNode;
  title: string;
};

/** Limite une erreur React à une section du portail (médecin, admin, IPS, etc.). */
export function PortalSectionBoundary({ children, title }: Props) {
  return <SectionErrorBoundary title={title}>{children}</SectionErrorBoundary>;
}
