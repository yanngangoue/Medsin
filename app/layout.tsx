import type { Metadata } from "next";
import { Inter, Montserrat, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
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

const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Anne-sante — Perte de poids GLP-1 avec Anne, coach santé IA",
    template: "%s · Anne-sante",
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
      <body className={`${montserrat.variable} ${jakarta.variable} ${playfair.variable} ${inter.variable} overflow-x-hidden font-sans antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
