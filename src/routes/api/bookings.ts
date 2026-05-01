import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { createBooking, listBookings } from "@/server/api/bookings";

export const Route = createFileRoute("/api/bookings")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          return json(await listBookings(new URL(request.url)));
        } catch (err) {
          if (err instanceof z.ZodError) {
            return json({ error: err.message }, { status: 400 });
          }
          throw err;
        }
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const created = await createBooking(body);
          return json(created, { status: 201 });
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
