"use client";

import { signOut } from "next-auth/react";

type Props = { className?: string; callbackUrl?: string };

export function SignOutButton({
  className = "text-sm font-medium text-slate-600 hover:text-[#1D9E75]",
  callbackUrl = "/",
}: Props) {
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl })}
      className={className}
    >
      Déconnexion
    </button>
  );
}
