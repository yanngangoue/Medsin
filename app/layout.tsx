import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "./providers";

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  variable: "--font-medsim-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "MedSim — Perte de poids GLP-1 avec Anne, coach santé IA",
    template: "%s · MedSim",
  },
  description:
    "Prescription GLP-1 en ligne, livraison discrète et Anne, coach santé IA proactive pour les Canadiens francophones.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr-CA" className="scroll-smooth">
      <body className={`${montserrat.variable} overflow-x-hidden font-sans antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
