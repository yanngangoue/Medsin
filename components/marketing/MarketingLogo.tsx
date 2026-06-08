import Link from "next/link";
import { MedsimLogo } from "@/components/MedsimLogo";

type Props = {
  className?: string;
  variant?: "light" | "dark";
};

export function MarketingLogo({ className = "", variant = "light" }: Props) {
  return (
    <Link href="/" className={`inline-flex items-center ${className}`}>
      <MedsimLogo variant={variant === "dark" ? "onDark" : "default"} />
    </Link>
  );
}
