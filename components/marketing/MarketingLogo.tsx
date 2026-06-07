import Link from "next/link";

type Props = {
  className?: string;
  variant?: "light" | "dark";
};

export function MarketingLogo({ className = "", variant = "light" }: Props) {
  const text = variant === "dark" ? "text-white" : "text-[#1A1A2E]";

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1D4D3A] text-base font-black text-white">
        M
      </span>
      <span className={`text-xl font-bold tracking-tight ${text}`}>MedSim</span>
    </Link>
  );
}
