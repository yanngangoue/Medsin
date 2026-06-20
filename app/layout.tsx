import type { Metadata } from "next";
import { Montserrat, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "./providers";

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  variable: "--font-medsim-sans",
  weight: ["400", "500", "600", "700", "800"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-medsim-display",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Anne Santé — Perte de poids GLP-1 avec Anne, coach santé IA",
    template: "%s · Anne Santé",
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
      <body className={`${montserrat.variable} ${jakarta.variable} overflow-x-hidden font-sans antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
