import { TextInput } from "@dfds-ui/navaigator";

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
    <TextInput
      id={inputId}
      label={label}
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}
