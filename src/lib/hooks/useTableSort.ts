import { useCallback, useState } from "react";

export type SortDir = "asc" | "desc";

export interface SortState<K extends string> {
  key: K;
  dir: SortDir;
}

export function useTableSort<K extends string>(
  initialKey: K,
  initialDir: SortDir = "asc",
  defaultDir: (key: K) => SortDir = () => "asc",
) {
  const [sort, setSort] = useState<SortState<K>>({
    key: initialKey,
    dir: initialDir,
  });

  const toggle = useCallback(
    (key: K) => {
      setSort((prev) =>
        prev.key === key
          ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
          : { key, dir: defaultDir(key) },
      );
    },
    [defaultDir],
  );

  return { sort, toggle } as const;
}
