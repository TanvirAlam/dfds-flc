import { Select as SelectPrimitive, SelectField, SelectTrigger, SelectContent, SelectItem } from "@dfds-ui/navaigator";

export function Select({
  label,
  value,
  onChange,
  options,
  placeholder = "Any",
}: {
  label: string;
  value: string | null;
  onChange: (next: string | null) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
  placeholder?: string;
}) {
  const status = value === null && options.length > 0 ? "error" : undefined;
  const errorMessage = value === null && options.length > 0 ? "Please select an option" : undefined;

  return (
    <SelectField label={label} status={status} errorMessage={errorMessage}>
      <SelectPrimitive
        value={value ?? "__placeholder__"}
        onValueChange={(val: string) => onChange(val === "__placeholder__" ? null : val)}
      >
        <SelectTrigger placeholder={placeholder} />
        <SelectContent>
          <SelectItem value="__placeholder__" disabled>
            {placeholder}
          </SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectPrimitive>
    </SelectField>
  );
}