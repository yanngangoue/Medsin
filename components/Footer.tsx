import Link from "next/link";
import { MedsimLogo } from "@/components/MedsimLogo";

const FOOTER_LINKS = [
  { href: "/confidentialite", label: "Politique de confidentialité" },
  { href: "/politique-remboursement", label: "Politique de remboursement" },
  { href: "/contact", label: "Contact" },
  { href: "/a-propos", label: "À propos de nous" },
] as const;

export function Footer() {
  return (
    <footer className="bg-[var(--dark)] py-10 text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 sm:px-6">
        <div className="flex w-full flex-col items-center gap-4 text-center md:flex-row md:flex-wrap md:items-center md:justify-between md:text-left">
          <Link href="/" className="inline-block transition hover:opacity-95 hover:[transform:scale(1.02)]">
            <MedsimLogo variant="onDark" />
          </Link>
          <p className="text-[13px] text-white/80 md:border-l md:border-white/20 md:pl-4">
            © 2025 MedSim · Médecins certifiés · 100 % en ligne
          </p>
        </div>

        <nav
          aria-label="Liens du pied de page"
          className="flex flex-wrap items-center justify-center gap-x-1 gap-y-3 px-2 text-center text-[13px] leading-snug text-white/70"
        >
          {FOOTER_LINKS.map((link, index) => (
            <span key={link.href} className="inline-flex items-center">
              {index > 0 ? <span className="mx-2 text-white/30" aria-hidden>·</span> : null}
              <Link href={link.href} className="transition hover:text-white">
                {link.label}
              </Link>
            </span>
          ))}
        </nav>
      </div>
    </footer>
  );
}
