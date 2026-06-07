"use client";

import { signOutMedSim } from "@/lib/client-sign-out";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => void signOutMedSim("/")}
      className="text-sm font-medium text-slate-600 hover:text-[#1D9E75]"
    >
      Déconnexion
    </button>
  );
}
