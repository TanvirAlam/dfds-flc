import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { listTerminals } from "@/server/api/terminals";

export const Route = createFileRoute("/api/terminals")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          return json(await listTerminals(new URL(request.url)));
        } catch (err) {
          if (err instanceof z.ZodError) {
            return json({ error: err.message }, { status: 400 });
          }
          throw err;
        }
      },
    },
  },
});
