import type { Customer, Vessel } from "@/lib/api/types";
import type { BookingFilters } from "@/lib/filters/bookings";
import {
  setCustomer,
  setSearch,
  setVessel,
  toggleStatus,
} from "@/lib/filters/bookings";
import { Select } from "./Select";
import { SearchInput } from "./SearchInput";
import { StatusMultiSelect } from "./StatusMultiSelect";

export function FilterBar({
  filters,
  onChange,
  customers,
  vessels,
}: {
  filters: BookingFilters;
  onChange: (next: BookingFilters) => void;
  customers: Customer[];
  vessels: Vessel[];
}) {
  const customerOptions = customers
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => ({ value: c.id, label: c.name }));

  const vesselOptions = vessels
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((v) => ({ value: v.id, label: v.name }));

  return (
    <div className="mb-3 flex flex-wrap items-end gap-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <StatusMultiSelect
        selected={filters.statuses}
        onToggle={(s) => onChange(toggleStatus(filters, s))}
      />
      <Select
        label="Customer"
        value={filters.customerId}
        onChange={(v) => onChange(setCustomer(filters, v))}
        options={customerOptions}
        placeholder="Any customer"
      />
      <Select
        label="Vessel"
        value={filters.vesselId}
        onChange={(v) => onChange(setVessel(filters, v))}
        options={vesselOptions}
        placeholder="Any vessel"
      />
      <SearchInput
        label="Booking ref"
        value={filters.search}
        onChange={(v) => onChange(setSearch(filters, v))}
        placeholder="e.g. bkg_05"
      />
    </div>
  );
}
