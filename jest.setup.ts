/**
 * Registered via `setupFilesAfterEnv` — runs after the Jest test
 * framework is installed but before each test file loads.
 *
 *   - `@testing-library/jest-dom` matchers (toBeInTheDocument, …).
 *   - Polyfill `TextEncoder`/`TextDecoder` for libraries that still
 *     reach for them under jsdom.
 *
 * The API client tests build their own `Response`-shaped stubs rather
 * than rely on a `Response` polyfill; see `src/__tests__/lib/api/
 * client.test.ts`. This keeps Jest startup hermetic — no network
 * library coupling.
 */

import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "node:util";

if (typeof globalThis.TextEncoder === "undefined") {
  (globalThis as unknown as { TextEncoder: typeof TextEncoder }).TextEncoder =
    TextEncoder;
}
if (typeof globalThis.TextDecoder === "undefined") {
  (globalThis as unknown as { TextDecoder: typeof TextDecoder }).TextDecoder =
    TextDecoder;
}
