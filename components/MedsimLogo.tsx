import Image from "next/image";
import { MEDSIM_BRAND } from "@/lib/brand/medsim-logo";

type MedsimLogoProps = {
  className?: string;
  /** Vert sur fond clair ; blanc sur fond sombre. */
  variant?: "default" | "onDark";
};

export function MedsimLogo({ className = "", variant = "default" }: MedsimLogoProps) {
  const src =
    variant === "onDark" ? MEDSIM_BRAND.logo.onDark : MEDSIM_BRAND.logo.default;

  return (
    <Image
      src={src}
      alt={MEDSIM_BRAND.name}
      width={112}
      height={28}
      unoptimized
      className={`h-5 w-auto shrink-0 sm:h-6 ${className}`}
      priority
    />
  );
}
