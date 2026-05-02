export function Select({
  label,
  value,
  onChange,
  options,
  placeholder = "Any",
  id,
}: {
  label: string;
  value: string | null;
  onChange: (next: string | null) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
  placeholder?: string;
  id?: string;
}) {
  const inputId = id ?? `sel-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <label htmlFor={inputId} className="flex flex-col gap-1 text-sm">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-600">
        {label}
      </span>
      <select
        id={inputId}
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? null : e.target.value)
        }
        className="min-w-[10rem] rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-800 shadow-sm outline-none transition focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-500"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
