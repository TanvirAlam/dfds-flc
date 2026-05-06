# Bugs & library observations

Notes collected while building the bookings slice. The README asks for sharp,
specific observations — this file tracks them as I hit them.

## NavAIgator / packaging

### 1. `@dfds-ui/navaigator` installation ✓ RESOLVED
- **Area:** packaging / onboarding
- **Status:** Package is now installed and available
- **Version:** 1.1.1
- **Integration:** Components integrated where appropriate (Button, Badge, Table, Drawer, Dialog, SelectField, TextInput)

### 2. Design tokens - migrated to NavAIgator
- **Area:** theming
- **Status:** Custom tokens in `src/styles.css` retained as fallback; NavAIgator tokens now available via `@dfds-ui/navaigator/styles.css`
- **Migration:** StatusBadge now uses NavAIgator Badge component with semantic variants (danger/warning/success/info)

### 3. `styles.css` - NavAIgator stylesheet now imported ✓
- **Area:** repo hygiene
- **Status:** `@import "@dfds-ui/navaigator/styles.css";` is now active
- **Impact:** NavAIgator component styles are available throughout the app

## Architectural notes (not bugs, but defensible calls)

### Selective NavAIgator adoption
- **Rationale:** Integrated NavAIgator components where they provide clear value:
  - `Button` - Used in forms, headers, and action buttons
  - `Badge` - Status badges with semantic variants
  - `Table` - Data table with consistent styling
  - `Drawer` - Side panel for create/edit flows
  - `Dialog` - Confirm dialogs
  - `SelectField` / `TextInput` - Form inputs with built-in validation states
- **Retained custom:** Some components remain custom-built to maintain specific interactions (e.g., multi-select status filter, URL-synced state)

### Plain `<table>` over a NavAIgator data-table (now upgraded)
- **Rationale:** Was using semantic `<table>` for accessibility. Now upgraded to NavAIgator `Table` component for consistent styling while maintaining semantic structure.

### Native `title` attribute for truncation tooltips
- **Rationale:** Using `TruncatedText` component from existing table utils. When NavAIgator `Tooltip` is explored further, could wrap for enhanced positioning.

### Hand-rolled `useBookings` hook
- **Rationale:** TanStack Query isn't in the dependency tree. A `useEffect` + `AbortController` is honest and easy to defend.

### Client-side filtering
- **Rationale:** Seeded dataset is ~20 rows; realistic ops views are low-hundreds. Filtering in memory is simpler.

### "Sailing" filter intentionally omitted
- The README mentions sailings, but `bookings` rows have no `sailingId` column — they reference a `vesselId`.

### Side drawer for create/edit
- **Decision:** Right-side drawer using NavAIgator `Drawer` component. Keeps list visible while editing.

### Pessimistic submit
- **Decision:** Form waits for server response before showing success. Important for logistics data with real side effects.

### No pagination / virtualisation (yet)
- Seeded dataset is 20 rows. Growth path is clear: virtualise at ~500+ rows, then server-side paging.

### URL as the source of truth for filter state
- Filter state is URL-serialised. Shareable filtered views, reload-safe, browser Back is undo for free.
