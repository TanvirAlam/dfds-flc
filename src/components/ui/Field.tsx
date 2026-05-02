import { useId, type ReactNode } from "react";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className = "",
}: {
  label: ReactNode;
  htmlFor: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const hintId = useId();
  const errId = useId();

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="text-xs font-medium uppercase tracking-wide text-slate-700"
      >
        {label}
        {required ? (
          <span aria-hidden className="ml-0.5 text-rose-600">
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={hintId} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
      <p
        id={errId}
        role="alert"
        className={`min-h-[1.25rem] text-xs ${error ? "text-rose-700" : "text-transparent"}`}
      >
        {error ?? "​"}
      </p>
    </div>
  );
}

const INPUT_BASE =
  "w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 aria-[invalid=true]:border-rose-400 aria-[invalid=true]:focus-visible:ring-rose-500";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} className={`${INPUT_BASE} ${props.className ?? ""}`} />
  );
}

export function NumberInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return (
    <input
      {...props}
      type="number"
      className={`${INPUT_BASE} tabular-nums ${props.className ?? ""}`}
    />
  );
}

export function SelectInput(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  return (
    <select {...props} className={`${INPUT_BASE} ${props.className ?? ""}`} />
  );
}

export function DateTimeInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return (
    <input
      {...props}
      type="datetime-local"
      className={`${INPUT_BASE} tabular-nums ${props.className ?? ""}`}
    />
  );
}
