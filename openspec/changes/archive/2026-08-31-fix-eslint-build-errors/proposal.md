## Why

`pnpm run build` currently fails (`ELIFECYCLE`, exit code 1) because Next.js's build-time ESLint pass reports ~30 errors across the codebase. Investigation shows the large majority are a single root cause: `eslint.config.mjs` spreads `js.configs.recommended` (plain ESLint's core `no-unused-vars` / `no-undef` rules) into the flat config with no `files` scope, so it runs against `.ts`/`.tsx` files too — not just the `.js`/`.mjs` files it was clearly intended for (see the adjacent `linebreak-style` block, which *is* correctly scoped). Core `no-unused-vars`/`no-undef` don't understand TypeScript function-type parameter names or the `react-jsx` automatic runtime, so they misfire on things like `setOpen: (open: boolean) => void` (flags `open` as unused) and any file using `React.ReactNode`/`React.ElementType` in a type position without an explicit `import React` (flags `React` as undefined). `next/typescript` (already in the config) supersedes these with TS-aware equivalents, so the core rules are redundant for TS files and only produce false positives there.

A smaller set of errors are genuine `@typescript-eslint/no-explicit-any` violations (5 call sites) that need real type fixes, plus two pre-existing warnings (`no-img-element`, `react-hooks/exhaustive-deps`) that don't fail the build but are cheap to clean up while touching these files.

## What Changes

- Scope `js.configs.recommended` in `eslint.config.mjs` to `**/*.js`/`**/*.mjs` only (matching the existing `linebreak-style` block), so core `no-unused-vars`/`no-undef` stop running against TypeScript files.
- Fix the 5 genuine `@typescript-eslint/no-explicit-any` errors with real types (no `eslint-disable`):
  - `src/components/shared/generic-table.tsx:54`
  - `src/features/auth/context/AuthContext.tsx:105,121`
  - `src/lib/api/axios.ts:47,48`
- Fix the 2 pre-existing lint warnings surfaced in the same build output:
  - `src/app/(auth)/login/loginForm.tsx:76` — replace `<img>` with `next/image`'s `<Image />`
  - `src/app/(dashboard)/my-availabilities/[id]/page.tsx:27-33` — stabilize the `branches` useEffect dependency with `useMemo`
- No behavior change to any feature — this is a tooling/build-health fix only.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
None — this is a pure lint-configuration and type-annotation fix with no change to observable application behavior. `skip_specs: true` is set in `.openspec.yaml`.

## Impact

- `eslint.config.mjs` (config change, affects lint scope repo-wide)
- 8 source files touched for real fixes: `generic-table.tsx`, `AuthContext.tsx`, `axios.ts`, `loginForm.tsx`, `my-availabilities/[id]/page.tsx`
- No API, dependency, or schema changes. `pnpm run build` and `pnpm lint` should both exit 0 after this change.
