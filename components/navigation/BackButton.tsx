"use client";

import { useRouter } from "next/navigation";

type Props = {
  href: string;
  className?: string;
  children?: React.ReactNode;
};

function ChevronLeftIcon({ className }: { className?: string }) {
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
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

/** Retour explicite vers `href` (parcours guidés — pas d’historique navigateur). */
export function BackButton({
  href,
  className = "inline-flex max-w-full min-w-0 items-center gap-1 rounded-full border border-slate-200/90 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 sm:px-3 sm:text-sm",
  children = "Retour",
}: Props) {
  const router = useRouter();

  return (
    <button type="button" onClick={() => router.push(href)} className={className}>
      <ChevronLeftIcon className="shrink-0 text-[#1D9E75]" />
      <span className="truncate">{children}</span>
    </button>
  );
}
