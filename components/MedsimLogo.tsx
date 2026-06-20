import Image from "next/image";
import { APP_BRAND } from "@/lib/brand/app-brand";

type MedsimLogoProps = {
  className?: string;
  /** Vert sur fond clair ; blanc sur fond sombre. */
  variant?: "default" | "onDark";
};

/** Logo wordmark Anne-sante (composant historique MedsimLogo — nom interne conservé). */
export function MedsimLogo({ className = "", variant = "default" }: MedsimLogoProps) {
  const src = variant === "onDark" ? APP_BRAND.logo.onDark : APP_BRAND.logo.default;

  return (
    <Image
      src={src}
      alt={APP_BRAND.name}
      width={148}
      height={28}
      unoptimized
      className={`h-5 w-auto shrink-0 sm:h-6 ${className}`}
      priority
    />
  );
}

/** Alias explicite pour le nouveau branding */
export const AnneSanteLogo = MedsimLogo;
