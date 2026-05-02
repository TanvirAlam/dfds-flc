import { useId, type ReactNode } from "react";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  optional,
  children,
  className = "",
}: {
  label: ReactNode;
  htmlFor: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const messageId = useId();
  const showMessage = Boolean(error) || Boolean(hint);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-baseline justify-between gap-2">
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
        {optional ? (
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Optional
          </span>
        ) : null}
      </div>
      {children}
      {showMessage ? (
        <p
          id={messageId}
          role={error ? "alert" : undefined}
          className={`text-xs ${error ? "text-rose-700" : "text-slate-500"}`}
        >
          {error ?? hint}
        </p>
      ) : null}
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
