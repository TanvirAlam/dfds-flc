import type { ReactNode } from "react";

/**
 * Visual grouping for form fields. Purely presentational — carries no
 * validation or state logic so it can be lifted out of the form verbatim
 * for any other screen that wants the same look (detail view, wizards).
 */
export function Section({
  title,
  describedBy,
  children,
}: {
  title: string;
  describedBy: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500">{describedBy}</p>
      </div>
      {children}
    </section>
  );
}
