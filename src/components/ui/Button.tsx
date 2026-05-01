const BASE =
  "inline-flex items-center rounded-md text-sm font-medium shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const VARIANT = {
  primary:
    "bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-sky-500",
  secondary:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-sky-500",
  danger:
    "border border-rose-300 bg-white text-rose-900 hover:bg-rose-100 focus-visible:ring-rose-500",
} as const;

const SIZE = {
  default: "px-4 py-2",
  sm: "px-3 py-1.5",
} as const;

export type ButtonVariant = keyof typeof VARIANT;
export type ButtonSize = keyof typeof SIZE;

export function buttonStyles(
  variant: ButtonVariant = "secondary",
  size: ButtonSize = "default",
): string {
  return `${BASE} ${VARIANT[variant]} ${SIZE[size]}`;
}

export function Button({
  variant = "secondary",
  size = "default",
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      type="button"
      {...props}
      className={`${buttonStyles(variant, size)} ${className}`}
    />
  );
}
