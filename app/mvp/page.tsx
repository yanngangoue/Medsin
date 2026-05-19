"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function MvpPage() {
  if (!clerkEnabled) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Medsim MVP 🚀</h1>
        <p>
          Pour tester Clerk : définis <code className="rounded bg-slate-100 px-1">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> dans{" "}
          <code className="rounded bg-slate-100 px-1">.env</code>, puis redémarre le serveur.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Medsim MVP 🚀</h1>

      <SignedOut>
        <p>Tu n’es pas connecté</p>
        <SignInButton />
      </SignedOut>

      <SignedIn>
        <p>Bienvenue 👋</p>
        <UserButton />
      </SignedIn>
    </div>
  );
}
