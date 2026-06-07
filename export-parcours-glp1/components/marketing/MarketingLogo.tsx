type Props = {
  className?: string;
  variant?: "light" | "dark";
};

export function MarketingLogo({ className = "", variant = "light" }: Props) {
  const textClass = variant === "dark" ? "text-white" : "text-[#1A1A2E]";
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1D4D3A] text-[15px] font-bold text-white">
        M
      </span>
      <span className={`text-lg font-bold tracking-tight ${textClass}`}>MedSim</span>
    </div>
  );
}
