import type { Metadata } from "next";
import { IpsShell } from "@/components/ips/IpsShell";

export const metadata: Metadata = {
  title: "Espace IPS — MedSim",
  description: "File d'attente, dossiers patients et clavardage IPS — MedSim.",
};

export default function IpsDashboardLayout({ children }: { children: React.ReactNode }) {
  return <IpsShell>{children}</IpsShell>;
}
