import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
  children: ReactNode;
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  children,
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-teal-600 text-white hover:bg-teal-700 focus-visible:outline-teal-600"
      : variant === "outline"
        ? "border border-[var(--border)] bg-white text-slate-800 hover:bg-slate-50"
        : "text-teal-700 hover:bg-teal-50";

  return (
    <button type={type} className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}
