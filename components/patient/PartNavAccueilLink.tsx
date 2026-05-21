import Link from "next/link";
import { PUBLIC_CATALOG_HOME } from "@/lib/public-catalog";

type Props = {
  className?: string;
  /** Sur le bandeau vert de l’accueil */
  variant?: "default" | "onDark";
  onNavigate?: () => void;
};

const variantClass: Record<NonNullable<Props["variant"]>, string> = {
  default: "font-semibold uppercase tracking-wide text-[#1D9E75] hover:text-[var(--teal-900)]",
  onDark:
    "text-[11px] font-semibold uppercase tracking-wide text-white/95 hover:text-white sm:text-xs",
};

/** Lien « Accueil » vers le catalogue des services (page d’accueil). */
export function PartNavAccueilLink({ className = "", variant = "default", onNavigate }: Props) {
  return (
    <Link href={PUBLIC_CATALOG_HOME} onClick={onNavigate} className={className || variantClass[variant]}>
      Accueil
    </Link>
  );
}
