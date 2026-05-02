type MedsimLogoProps = {
  className?: string;
  variant?: "default" | "onDark";
};

export function MedsimLogo({ className = "", variant = "default" }: MedsimLogoProps) {
  const isDark = variant === "onDark";
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-[15px] font-bold ${
          isDark ? "bg-[var(--teal)] text-white" : "bg-[var(--teal)] text-white"
        }`}
      >
        M
      </span>
      <span
        className={`text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-[var(--gray-900)]"}`}
      >
        Medsim
      </span>
    </div>
  );
}
