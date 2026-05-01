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

### 2. `styles.css` imports `@dfds-ui/navaigator/styles.css` commented out
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
