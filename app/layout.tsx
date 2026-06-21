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
  title: "Anne Santé — Télésanté GLP-1 au Québec",
  description:
    "Ordonnance GLP-1 par une IPS certifiée, coach IA Anne incluse. Sans file d'attente ni rendez-vous en clinique.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Anne Santé",
    description: "Télésanté GLP-1 au Québec",
    url: "https://anne-sante.vercel.app",
    siteName: "Anne Santé",
  },
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
