import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/Button";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-slate-900">
        DFDS Frontend Lead Challenge
      </h1>
      <p className="mt-3 text-slate-700">
        An internal tool for the ops team to view and manage freight bookings.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button asChild variant="primary">
          <Link to="/bookings">Open bookings</Link>
        </Button>
        <a
          href="/api/docs"
          className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          API docs
        </a>
      </div>

      <p className="mt-8 text-sm text-slate-500">
        See <code className="rounded bg-slate-100 px-1">/api/docs</code> for the
        Swagger UI, or{" "}
        <code className="rounded bg-slate-100 px-1">/api/openapi.json</code> for
        the raw spec.
      </p>
    </main>
  );
}