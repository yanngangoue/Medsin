"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl: "/" })}
      className="text-sm font-medium text-slate-600 hover:text-[#1D9E75]"
    >
      Déconnexion
    </button>
  );
}
