import type { SortDir, SortState } from "@/lib/hooks/useTableSort";

export function Th({
  children,
  className = "",
  scope,
}: {
  children: React.ReactNode;
  className?: string;
  scope?: "col" | "row";
}) {
  return (
    <th scope={scope} className={`px-3 py-2.5 align-middle ${className}`}>
      {children}
    </th>
  );
}

export function SortableTh<K extends string>({
  children,
  className = "",
  scope,
  sort,
  sortKey,
  onToggle,
}: {
  children: React.ReactNode;
  className?: string;
  scope?: "col" | "row";
  sort: SortState<K>;
  sortKey: K;
  onToggle: (key: K) => void;
}) {
  const active = sort.key === sortKey;
  const ariaSort: "ascending" | "descending" | "none" = active
    ? sort.dir === "asc"
      ? "ascending"
      : "descending"
    : "none";

  return (
    <th
      scope={scope}
      aria-sort={ariaSort}
      className={`px-3 py-2.5 align-middle ${className}`}
    >
      <button
        type="button"
        onClick={() => onToggle(sortKey)}
        className="inline-flex items-center gap-1 rounded text-inherit uppercase outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
      >
        <span>{children}</span>
        <SortIndicator active={active} dir={sort.dir} />
      </button>
    </th>
  );
}

function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    return (
      <span aria-hidden className="text-slate-300">
        ↕
      </span>
    );
  }
  return (
    <span aria-hidden className="text-slate-700">
      {dir === "asc" ? "↑" : "↓"}
    </span>
  );
}

export function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-3 py-2.5 align-middle ${className}`}>{children}</td>
  );
}

export function TruncatedText({
  value,
  maxWidth,
}: {
  value: string;
  maxWidth: string;
}) {
  return (
    <span className={`block truncate ${maxWidth}`} title={value}>
      {value}
    </span>
  );
}
