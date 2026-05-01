import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { listCustomers } from "@/server/api/customers";

export const Route = createFileRoute("/api/customers")({
  server: {
    handlers: {
      GET: async () => json(await listCustomers()),
    },
  },
});
