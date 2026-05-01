import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { listVessels } from "@/server/api/vessels";

export const Route = createFileRoute("/api/vessels")({
  server: {
    handlers: {
      GET: async () => json(await listVessels()),
    },
  },
});
