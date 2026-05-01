# DFDS — Frontend Lead Challenge

Welcome. You are interviewing as our incoming **Frontend Lead**. After the screening call, this is what you'll prepare ahead of your tech interview — and what we'll spend most of the interview talking about. We'll walk through the code together, ask why you made each call, and explore what you'd do next.

A small, well-considered slice gives us more to talk about than a sprawling half-finished one. Judgment over volume.

### Logistics

- **Send us the repo link ~24 hours before your interview** so we can read through it beforehand.
- **Pick your interview slot with enough runway** to do the prep without rushing — we're flexible on timing.
- **Do not fork this repo.** Clone it to a new repo of your own (`git clone` then push to a fresh remote) and share the link with us when you're done.

## The product

DFDS Freight wants a small internal tool for their operations team to view and manage freight bookings — the kind of bookings logistics customers (DSV, Kuehne+Nagel, IKEA Supply, etc.) place with us to ship cargo on our vessels between our terminals.

You have a working internal API (see [`/api/docs`](http://localhost:3000/api/docs)) with seeded data. The home page is intentionally empty — **everything you build in `src/` is what we'll review**.

### Two example features (suggestions, not requirements)

1. **A bookings view that's actually useful to an ops person.** A list, filters that matter (status? customer? vessel?), some way to see what's stuck or in-transit at a glance.
2. **A way to create or update a booking.** Whatever flow makes sense — full form, side panel, inline edit — it's your call.

If you see another feature that's worth building in the time you have, **build that instead**. Own the scope. Tell us why in the interview.

We're roughly thinking **half a day** of focused work. Don't blow a weekend on this.

## What's in the box

- **TanStack Start** (file-based routing for both UI and API in one process), React 19, Vite 7, TypeScript.
- **NavAIgator** ([`@dfds-ui/navaigator`](https://nav-a-igator.vercel.app/)) — DFDS-skinned UI library. Already wired up. Use it as much or as little as you like.
- **Tailwind v4**, also wired. NavAIgator's stylesheet ships utilities; you can mix in Tailwind for layout.
- **An internal API at `/api/*`** — bookings, customers, vessels, **terminals**, and **sailings** (planned vessel departures with capacity + status) — backed by SQLite + Drizzle, validated end-to-end with Zod.
- **Swagger UI at `/api/docs`** — full OpenAPI 3.1 spec at `/api/openapi.json`. Try-it-out works.
- **A near-empty home page**, so we can see what *you* wrote.

You don't need to touch the API to do the brief — but if you do, both the Zod schemas and the Swagger docs update automatically (the spec is generated from the same Zod source as the runtime validators).

## NavAIgator is experimental

NavAIgator is a **brand-new** AI-generated UI library we're using to skin our React apps in DFDS branding. It's pre-1.0. **Some of it will be janky.**

**Spotting bugs in NavAIgator is part of the exercise — and great talking-point material.** When something behaves oddly — wrong contrast in a dark surface, a focus ring that doesn't appear, a prop that should exist and doesn't, a TypeScript type that lies — jot it in a `BUGS.md` at the root of your repo (or a section of your README). Be specific: which component, what you expected, what happened, ideally a one-line repro.

We weigh this **positively**. A candidate who ships fewer features but brings 5 sharp library observations to the interview is more valuable than one who plasters over them silently.

## Using AI is fine — but you own what you commit

We expect you to use AI tooling. We use it ourselves. **The rule is:** every line you commit, you can defend in the interview. "The AI wrote it" is not an answer to "why is this here?" — neither is it an excuse for committing dead code, a style mismatch, or a security hole.

Read the diff before you push.

## Setup

You need **Node ≥22** (we use `node:sqlite`, which was stabilized in 22) and **pnpm**.

```bash
pnpm install
pnpm dev
```

That's it. The first run creates `local.db` and seeds 8 customers, 5 vessels, and 20 bookings. Re-running is idempotent.

- App: <http://localhost:3000>
- API docs: <http://localhost:3000/api/docs>
- Spec: <http://localhost:3000/api/openapi.json>

To reset the DB, delete `local.db` and run `pnpm dev` again.

### NavAIgator MCP (recommended)

NavAIgator's Storybook exposes an MCP server, so your AI editor can introspect components, props, tokens, and stories directly. A `.mcp.json` is committed at the repo root pointing at it:

```json
{
  "mcpServers": {
    "navaigator": {
      "type": "http",
      "url": "https://nav-a-igator.vercel.app/mcp"
    }
  }
}
```

- **Claude Code**: picks `.mcp.json` up automatically; approve on first run.
- **Cursor / Windsurf**: copy the `mcpServers` block into your IDE's MCP settings.
- Browse the same docs in a browser at <https://nav-a-igator.vercel.app/>.

## What we'll talk about in the interview

This isn't a checklist — it's the shape of the conversation we'll have, anchored in the code you sent us.

**Code & craft**
- How is the code organised? Where does logic live?
- How do you handle loading, error, and empty states?
- What's your form story — controlled, uncontrolled, validated when?
- TypeScript: are the types load-bearing, or are they decoration?

**Product judgment**
- What did you choose to build, and what did you choose to skip?
- What would you build next if you had another half day?
- Where is the UX weakest, and why did you accept it?

**The library**
- Which NavAIgator components did you reach for, and where did you bail to plain HTML?
- Which bugs did you find?
- What's missing from the library that you wanted?

**Lead's perspective** (be ready to talk briefly)
- How would you set up CI/CD for a small frontend team shipping daily?
- How do you bring a team along when adopting a new internal UI library?
- Where do you draw the line on AI-assisted development for the team you'd lead?
- How would you instrument this for production — logging, error tracking, performance?
- What's your error-handling philosophy when an internal API can return surprising things?

## Sending us the repo

Push your work to a public GitHub repo (or a fork of this one) and send us the link **about 24 hours before your interview**. Include `BUGS.md` if you found any (we hope you did).

Have fun. Pick the slice you want to talk about.
