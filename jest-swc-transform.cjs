/**
 * Custom Jest transform wrapping @swc/jest.
 *
 * Vite exposes `import.meta.env` at dev/build time, but Jest runs in
 * Node CJS context where `import.meta` is a syntax error. This wrapper
 * rewrites `import.meta.env` → `process.env` before handing the source
 * to SWC for TypeScript / JSX compilation.
 */

const { createTransformer } = require("@swc/jest");

const swc = createTransformer({
  jsc: {
    parser: { syntax: "typescript", tsx: true },
    transform: { react: { runtime: "automatic" } },
  },
  module: { type: "commonjs" },
});

module.exports = {
  process(src, filename, opts) {
    const patched = src.replace(/import\.meta\.env/g, "process.env");
    return swc.process(patched, filename, opts);
  },
};
