export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  label,
  id,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  label: string;
  id?: string;
}) {
  const inputId = id ?? `in-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <label htmlFor={inputId} className="flex flex-col gap-1 text-sm">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-600">
        {label}
      </span>
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-[14rem] rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-500"
      />
    </label>
  );
}
