type MedsimLogoProps = {
  className?: string;
  variant?: "default" | "onDark";
};

export function MedsimLogo({ className = "", variant = "default" }: MedsimLogoProps) {
  const isDark = variant === "onDark";
  return (
    <span
      className={`text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-[var(--gray-900)]"} ${className}`}
    >
      MedSim
    </span>
  );
}
