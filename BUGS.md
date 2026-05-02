# Bugs & library observations

Notes collected while building the bookings slice. The README asks for sharp,
specific observations — this file tracks them as I hit them.

## NavAIgator / packaging

### 1. `@dfds-ui/navaigator` cannot install without auth, and nothing in the repo says so
- **Area:** packaging / onboarding
- **Expected:** `pnpm install` after cloning the challenge repo succeeds on a
  stock Node 22 + pnpm machine (the README says "That's it").
- **Actual:** install fails with
  `ERR_PNPM_FETCH_401  GET https://npm.pkg.github.com/download/@dfds-frontend/navigator-styles/...`
  because `@dfds-ui/navaigator` transitively depends on
  `@dfds-frontend/navigator-styles@2.0.0`, which is published to GitHub
  Packages and requires a token with `read:packages`. There is no `.npmrc`,
  no note in the README, and no setup script that asks for a token.
- **Repro:** clone, run `pnpm install` without a pre-existing
  `@dfds-frontend:registry` entry + token. 401 in seconds.
- **Impact for this submission:** I built the bookings slice with plain
  HTML + Tailwind v4 rather than NavAIgator components (see architectural
  notes below). Swapping in NavAIgator later is a localised change because
  the presentational primitives (`StatusBadge`, `BookingsTable` cells) are
  isolated.

### 2. No usable DFDS/NavAIgator design tokens because the library won't install
- **Area:** theming
- **Expected:** a NavAIgator-shipped token like `--dfds-status-pending-bg`
  (or equivalent) to pull into our status badges so the app reads as DFDS
  at a glance.
- **Actual:** library isn't available (bug 1), so there is nothing to
  reference.
- **Workaround in this repo:** `src/styles.css` defines a small
  `--status-*-bg/fg/ring` token set with verified WCAG AA contrast (see
  the contrast table in that file). Components consume the tokens via
  CSS custom properties, never via raw hex or Tailwind colour utilities.
  When NavAIgator is installable, replacing those definitions with
  `var(--dfds-…)` is a one-file change and every consumer picks it up
  automatically. The same `--status-*` names already have dark-surface
  values set under `.dark`, so dark mode is a theming decision, not a
  component one.
- **Impact:** satisfies the "styles come from design tokens, not
  hard-coded hex values" acceptance criterion even without NavAIgator —
  the tokens are ours, but the seam is in the right place.

### 3. `styles.css` imports `@dfds-ui/navaigator/styles.css` commented out
- **Area:** repo hygiene
- **Expected:** the starter either imports the stylesheet or doesn't mention
  it — not leaves a commented-out import as a silent landmine.
- **Actual:** `src/styles.css` has
  `/* @import "@dfds-ui/navaigator/styles.css"; */` with no explanation.
  A new contributor can't tell whether removing it is safe.
- **Repro:** open `src/styles.css`.

## Architectural notes (not bugs, but defensible calls)

### Plain `<table>` over a NavAIgator data-table
- Rationale: NavAIgator wasn't installable in this environment (bug 1). A
  semantic `<table>` is accessible, cheap, and keeps the component surface
  obvious. The row/cell primitives in
  `src/components/bookings/BookingsTable.tsx` are small, so swapping them for
  NavAIgator equivalents later is a one-file change.

### Native `title` attribute for truncation tooltips
- Rationale: same as above. When NavAIgator's `Tooltip` is available I'd
  wrap `TruncatedText` with it to get consistent positioning and keyboard
  focus behaviour, but `title` is standards-compliant, works for mouse
  users, and doesn't lie to screen readers because the full text is also
  part of the cell content.

### Hand-rolled `useBookings` hook instead of TanStack Query
- Rationale: TanStack Query isn't in the dependency tree and the slice only
  has two async surfaces (list + lookups). A `useEffect` + `AbortController`
  is honest and easy to defend. If a second screen needs caching or
  background refetching, pulling in `@tanstack/react-query` is the next
  move.

### Client-side filtering (not server-side)
- Rationale: the `/api/bookings` endpoint accepts `?status=`, `?customerId=`,
  `?vesselId=` but each is **single-valued**, so a multi-select status
  filter would need either multiple requests or an API change to accept
  a list. The seeded dataset is ~20 rows; realistic ops views are
  low-hundreds. Filtering in memory is simpler, keeps one code path, and
  is well within acceptable for this scale.
- If the dataset grows past a few thousand rows, I'd: (a) extend the API
  to accept array params (`?status=pending,confirmed`), (b) move the
  predicate in `src/lib/filters/bookings.ts#matchesFilters` behind a
  feature flag that chooses server vs client, and (c) keep URL-sync
  identical so the URL stays the contract either way.
- Filter code: `src/lib/filters/bookings.ts`.

### "Sailing" filter intentionally omitted
- The README mentions sailings, but `bookings` rows have no `sailingId`
  column (`src/server/db/schema.ts:46-66`) — they reference a `vesselId`
  and have free-text `origin`/`destination`. Filtering by sailing would
  require a schema migration. The closest honest proxy at this point is
  the `vessel` filter, which ships.

### Side drawer for create/edit (not modal, not a route)
- **Decision:** create and edit both happen in a right-side `<dialog>`-based
  drawer, opened via a URL query param (`?edit=new` or `?edit=bkg_05`).
- **Why drawer over modal:** ops users scan the table; keeping the list
  visible while editing lets them eyeball adjacent rows without losing
  context. Centred modals also scroll awkwardly when the form is tall.
- **Why drawer over a dedicated route:** a route would discard list state
  (filters, sort, scroll) on open/close without extra preservation code.
  The drawer keeps all of that live.
- **Why the native `<dialog>` element:** focus trap, `Escape` handling,
  and backdrop inertness come for free from the browser. No a11y library
  required; no focus-manager to debug. Stacks cleanly when the "discard
  changes?" confirm opens on top.
- **URL state:** sharable (`/bookings?edit=bkg_05` opens on that row),
  reload-safe, and browser Back closes the drawer instead of navigating
  away from the list.

### Pessimistic submit (not optimistic)
- **Decision:** the submit button disables, the form waits for the server
  response, and only then do we upsert the row + show the success toast.
- **Why not optimistic:** a freight booking has real side effects —
  capacity changes, schedule implications, customer-facing commitments.
  A row that appears "saved" and then disappears on a server 400/500 is
  worse than a 200ms spinner. The trade-off would flip for a chat message
  or a like button; it does not flip for logistics.
- **Anti-double-submit:** the submit button is `disabled` while pending,
  and the form also guards with a 500ms soft lock (`lockedAt` in
  `BookingForm.tsx`) to survive any race where a double-click lands
  before the disable paints.
- **Error surfacing:** server 400 bodies are parsed as JSON-encoded
  `ZodError.issues` and mapped to per-field errors
  (`extractFieldErrors` in `BookingForm.tsx`). If the server ever changes
  its error shape, that one function is the only place to update.

### No pagination / virtualisation (yet)
- Seeded dataset is 20 rows. A realistic ops view is tens to low-hundreds.
  A native `<table>` renders a few hundred rows on a laptop without
  measurable lag; adding pagination or virtualisation now would be
  premature abstraction.
- The table is already wrapped in a bounded-height scroll container
  (`BookingsTable.tsx`), so the growth path is clear:
  - **First**: if we start seeing noticeable rendering at ~500+ rows,
    move the row component to `react-window` / `@tanstack/react-virtual`
    and keep the `<thead>` outside the virtualised body.
  - **Second**: if the backend starts returning thousands, move filtering
    and paging server-side (`?limit`/`?offset`) and replace the
    in-memory filter with a fetch-on-filter flow. The URL contract stays
    identical because filter state is already URL-serialised.

### URL as the source of truth for filter state
- `validateSearch` in `src/routes/bookings.tsx` defines the search schema;
  `useSearch`/`useNavigate` read/write it. Benefits: shareable filtered
  views, reload-safe, browser Back is undo for free. Trade-off: every
  keystroke in the ref-search input writes to the URL with `replace: true`
  so it doesn't pollute history. A debounce is a cheap follow-up if the
  URL-rewrite cost ever shows up in the React Profiler.
