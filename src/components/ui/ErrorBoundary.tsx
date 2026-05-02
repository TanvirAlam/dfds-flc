import { Component, type ErrorInfo, type ReactNode } from "react";
import { reportError, toUserFacingMessage } from "@/lib/errors";
import { Button } from "@/components/ui/Button";

/**
 * Top-level safety net for uncaught render errors.
 *
 * Wraps the whole app in `__root.tsx`. If anything inside throws during
 * render, layout, effects, or event handlers that surface as render
 * errors, the user gets a friendly fallback instead of a white screen.
 *
 * Class component because React still has no hook equivalent of
 * `componentDidCatch` in 19. Deliberately tiny — no state machines, no
 * retry heuristics, just a "reset the subtree" button that remounts
 * children by bumping a key.
 */

interface Props {
  children: ReactNode;
  /** Optional custom fallback renderer; defaults to `DefaultFallback`. */
  fallback?: (args: { error: unknown; reset: () => void }) => ReactNode;
}

interface State {
  error: unknown;
  /** Bumped on reset to remount children. */
  resetKey: number;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, resetKey: 0 };

  static getDerivedStateFromError(error: unknown): Partial<State> {
    return { error };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    reportError("ErrorBoundary", error);
    // `componentStack` is useful in dev — logged through the same report
    // helper so it lands next to the error itself.
    if (import.meta.env?.DEV) {
      // eslint-disable-next-line no-console
      console.log("[error] componentStack", info.componentStack);
    }
  }

  reset = () => {
    this.setState((s) => ({ error: null, resetKey: s.resetKey + 1 }));
  };

  render() {
    if (this.state.error !== null) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          reset: this.reset,
        });
      }
      return <DefaultFallback error={this.state.error} onReset={this.reset} />;
    }

    // Key on reset count so children remount on "Try again" — clears any
    // broken local state that caused the original error.
    return <div key={this.state.resetKey}>{this.props.children}</div>;
  }
}

function DefaultFallback({
  error,
  onReset,
}: {
  error: unknown;
  onReset: () => void;
}) {
  const ui = toUserFacingMessage(error);

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <div
        role="alert"
        className="rounded-lg border border-rose-200 bg-rose-50 px-5 py-5 text-sm text-rose-900"
      >
        <h1 className="text-base font-semibold">{ui.title}</h1>
        <p className="mt-1 text-rose-800/90">{ui.body}</p>
        <div className="mt-4">
          <Button variant="danger" size="sm" onClick={onReset}>
            Try again
          </Button>
        </div>
      </div>
    </main>
  );
}
