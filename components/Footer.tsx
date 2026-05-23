import Link from "next/link";
import { MedsimLogo } from "@/components/MedsimLogo";

export function Footer() {
  return (
    <footer className="bg-[var(--dark)] py-10 text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 px-4 text-center sm:px-6 md:flex-row md:flex-wrap md:gap-x-3 md:gap-y-2 md:text-left">
        <Link href="/" className="inline-block transition hover:opacity-95 hover:[transform:scale(1.02)]">
          <MedsimLogo variant="onDark" />
        </Link>
        <p className="text-[13px] text-white/80 md:border-l md:border-white/20 md:pl-4">
          © 2025 Medsim · Médecins certifiés · 100% en ligne
        </p>
      </div>
    </footer>
  );
}
