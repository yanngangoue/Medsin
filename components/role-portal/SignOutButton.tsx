"use client";

import { signOutMedSim } from "@/lib/client-sign-out";

type Props = {
  callbackUrl?: string;
  className?: string;
};

export function SignOutButton({
  callbackUrl = "/",
  className = "text-sm font-medium text-slate-600 hover:text-[#1D9E75]",
}: Props) {
  return (
    <button
      type="button"
      onClick={() => void signOutMedSim(callbackUrl)}
      className={className}
    >
      Déconnexion
    </button>
  );
}
