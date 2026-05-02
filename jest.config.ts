import type { Config } from "jest";

/**
 * Jest configuration.
 *
 * - `jsdom` environment so component tests can touch the DOM.
 * - Transform: a small wrapper around `@swc/jest` that rewrites
 *   `import.meta.env` → `process.env` before compilation. Vite exposes
 *   `import.meta.env` at dev/build time, but Jest runs in CJS and would
 *   otherwise throw a `SyntaxError` on any module that touches it
 *   (e.g. `src/lib/errors.ts`).
 * - Tests live under `src/__tests__` and mirror the source tree. That
 *   keeps `src/` focused on production code and makes it trivial to find
 *   a test for any module.
 * - The `@/*` alias points at `src/*` so tests share the app's import
 *   ergonomics and can be moved around without editing every relative
 *   path.
 * - `jest-dom` matchers are registered once via `jest.setup.ts`.
 */
const config: Config = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src/__tests__"],
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    // Stylesheets aren't executable under jsdom; stub them out.
    "\\.css$": "<rootDir>/src/__tests__/__mocks__/style.ts",
  },
  transform: {
    "^.+\\.(t|j)sx?$": "<rootDir>/jest-swc-transform.cjs",
  },
  clearMocks: true,
};

export default config;
