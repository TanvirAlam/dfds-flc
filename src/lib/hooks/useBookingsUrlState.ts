import { useCallback, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  filtersToSearch,
  parseSearch,
  type BookingFilters,
  type BookingsSearchParams,
} from "@/domain/bookings/filters";

/**
 * URL state management for `/bookings`.
 *
 * Single source of truth for:
 *   - the route's search-schema shape (filters + drawer `edit` param),
 *   - reading filters out of the URL,
 *   - writing filters, opening the drawer, closing the drawer.
 *
 * Returns the filter object + drawer state ready for the page to render,
 * and stable handlers the page can pass down without re-creating inline.
 */

export interface BookingsUrlSearch extends BookingsSearchParams {
  /** `new` → create drawer; a booking id → edit drawer; absent → closed. */
  edit?: string;
}

/**
 * `validateSearch` for the route config. Pulled out so the route file
 * is a thin shell — no inline schema coercion.
 */
export function validateBookingsSearch(
  search: Record<string, unknown>,
): BookingsUrlSearch {
  const str = (k: string) =>
    typeof search[k] === "string" ? (search[k] as string) : undefined;
  return {
    status: str("status"),
    customerId: str("customerId"),
    vesselId: str("vesselId"),
    q: str("q"),
    edit: str("edit"),
  };
}

export type DrawerMode = "create" | "edit" | null;

export interface UseBookingsUrlStateResult {
  filters: BookingFilters;
  drawerMode: DrawerMode;
  /** The raw `edit` value: `"new"`, a booking id, or `undefined`. */
  drawerTarget: string | undefined;
  setFilters: (next: BookingFilters) => void;
  openDrawer: (target: "new" | string) => void;
  closeDrawer: () => void;
}

export function useBookingsUrlState(
  search: BookingsUrlSearch,
): UseBookingsUrlStateResult {
  // No `from` argument: TanStack's typed `from` is tied to the
  // generated route tree, which would couple this hook to that
  // generation. The router infers the current route from context
  // instead, and we only ever call it from the `/bookings` page.
  const navigate = useNavigate();

  const filters = useMemo<BookingFilters>(() => parseSearch(search), [search]);

  const drawerMode: DrawerMode = search.edit
    ? search.edit === "new"
      ? "create"
      : "edit"
    : null;

  const setFilters = useCallback(
    (next: BookingFilters) => {
      // `edit` is kept sticky so typing in the search box doesn't close
      // the drawer. `replace` keeps history from accumulating one entry
      // per keystroke.
      navigate({
        to: ".",
        search: () =>
          ({
            ...filtersToSearch(next),
            edit: search.edit,
          }) as BookingsUrlSearch,
        replace: true,
      });
    },
    [navigate, search.edit],
  );

  const openDrawer = useCallback(
    (target: "new" | string) => {
      navigate({
        to: ".",
        search: () => ({ ...search, edit: target }) as BookingsUrlSearch,
      });
    },
    [navigate, search],
  );

  const closeDrawer = useCallback(() => {
    navigate({
      to: ".",
      search: () => {
        const { edit: _drop, ...rest } = search;
        return rest as BookingsUrlSearch;
      },
    });
  }, [navigate, search]);

  return {
    filters,
    drawerMode,
    drawerTarget: search.edit,
    setFilters,
    openDrawer,
    closeDrawer,
  };
}
