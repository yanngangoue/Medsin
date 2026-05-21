"use client";

import { useRouter } from "next/navigation";

type Props = {
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export function ForwardButton({
  href,
  onClick,
  disabled = false,
  className = "inline-flex items-center gap-1 rounded-full border border-slate-200/90 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-45",
  children = "Suivant",
}: Props) {
  const router = useRouter();

  function handleClick() {
    if (disabled) return;
    if (onClick) {
      onClick();
      return;
    }
    if (href) router.push(href);
  }

  return (
    <button type="button" onClick={handleClick} disabled={disabled} className={className}>
      <span>{children}</span>
      <ChevronRightIcon className="shrink-0 text-[#1D9E75]" />
    </button>
  );
}
