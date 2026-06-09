"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Titre court affiché à l'utilisateur. */
  title?: string;
  className?: string;
};

type State = { error: Error | null };

export class SectionErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[SectionErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className={`rounded-2xl border border-red-200 bg-red-50 p-6 text-center ${this.props.className ?? ""}`}
          role="alert"
        >
          <p className="text-sm font-semibold text-red-900">
            {this.props.title ?? "Cette section est temporairement indisponible."}
          </p>
          <p className="mt-2 text-sm text-red-800">
            Rechargez la page ou réessayez dans quelques instants.
          </p>
          <button
            type="button"
            className="mt-4 rounded-xl bg-red-800 px-4 py-2 text-sm font-medium text-white hover:bg-red-900"
            onClick={() => this.setState({ error: null })}
          >
            Réessayer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
