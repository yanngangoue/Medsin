import type { Metadata } from "next";
import { IpsShell } from "@/components/ips/IpsShell";

export const metadata: Metadata = {
  title: "Espace IPS — Anne-sante",
  description: "File d'attente, dossiers patients et clavardage IPS — Anne-sante.",
};

export default function IpsDashboardLayout({ children }: { children: React.ReactNode }) {
  return <IpsShell>{children}</IpsShell>;
}
