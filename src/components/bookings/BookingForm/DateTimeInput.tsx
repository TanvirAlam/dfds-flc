import { TextInput } from "@dfds-ui/navaigator";

export function DateTimeInput({
  label,
  value,
  onChange,
  status,
  errorMessage,
  assistiveText,
  required,
  ...props
}: {
  label: string;
  value: string;
  onChange: (e: any) => void;
  status?: "error" | "none";
  errorMessage?: string;
  assistiveText?: string;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <TextInput
      label={label}
      type="datetime-local"
      value={value}
      onChange={onChange}
      status={status}
      errorMessage={errorMessage}
      assistiveText={assistiveText}
      required={required}
      {...props}
    />
  );
}