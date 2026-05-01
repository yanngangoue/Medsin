"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

type BoundaryState = { error: Error | null };

class RootErrorBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-8 text-center">
          <p className="max-w-md text-base font-semibold text-slate-900">
            Une erreur empêche l’affichage de la page.
          </p>
          <p className="max-w-lg font-mono text-xs text-red-700">{this.state.error.message}</p>
          <button
            type="button"
            className="rounded-xl bg-[#1D9E75] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#188763]"
            onClick={() => window.location.reload()}
          >
            Recharger la page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/** Client requis : `SessionProvider` ne peut pas être importé depuis un layout serveur. */
export function SessionProvider({ children }: { children: ReactNode }) {
  return (
    <RootErrorBoundary>
      <NextAuthSessionProvider refetchOnWindowFocus={false}>{children}</NextAuthSessionProvider>
    </RootErrorBoundary>
  );
}
