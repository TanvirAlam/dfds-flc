export function Spinner({
  className = "",
  size = 14,
  "aria-label": ariaLabel,
}: {
  className?: string;
  size?: number;
  "aria-label"?: string;
}) {
  return (
    <svg
      role={ariaLabel ? "img" : undefined}
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`motion-safe:animate-spin ${className}`}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="42 18"
      />
    </svg>
  );
}
