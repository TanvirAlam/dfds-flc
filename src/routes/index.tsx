import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main style={{ maxWidth: 720, margin: "4rem auto", padding: "0 1.5rem", fontFamily: "system-ui, sans-serif", lineHeight: 1.5 }}>
      <h1>DFDS Frontend Lead Challenge</h1>
      <p>
        This is your starter. The home page is intentionally empty — what you
        build here is what we&rsquo;ll review.
      </p>
      <p>
        See <a href="/api/docs"><code>/api/docs</code></a> for the API
        (Swagger UI). The OpenAPI spec is at{" "}
        <a href="/api/openapi.json"><code>/api/openapi.json</code></a>.
      </p>
      <p>
        Read <code>README.md</code> for the brief.
      </p>
    </main>
  );
}
