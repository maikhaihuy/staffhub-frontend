## Context

See proposal.md - Why for the root-cause analysis. In short: `eslint.config.mjs` spreads `js.configs.recommended` unscoped, so core `no-unused-vars`/`no-undef` run on `.ts`/`.tsx` files and produce false positives on TS-only constructs (function-type parameter names, `React.*` used only as a type with the `react-jsx` automatic runtime). `next/typescript` (already active) already supersedes these rules for TS files with `@typescript-eslint/no-unused-vars`, so no coverage is lost by scoping the core rules down to plain JS/MJS.

## Goals / Non-Goals

**Goals:**
- `pnpm run build` and `pnpm lint` exit 0.
- No `eslint-disable` comments added to silence the genuine `no-explicit-any` errors — replace `any` with real types.
- No change to runtime behavior of any touched file.

**Non-Goals:**
- Not doing a repo-wide lint/type cleanup beyond the errors in the reported build output.
- Not fixing the two warnings' underlying UX (image sizing, effect timing) beyond what's needed to satisfy the rule — no visual redesign.
- Not touching `next/core-web-vitals` / `next/typescript` configs (only the manually-added `js.configs.recommended` block is in scope).

## Decisions

**Scope `js.configs.recommended` to `**/*.js`/`**/*.mjs` instead of removing it.** The block exists to lint the repo's own JS config files (e.g. `eslint.config.mjs` itself, `postcss.config.mjs`). Removing it entirely would drop `no-unused-vars`/`no-undef` coverage for those files with no equivalent replacement (they're outside `next/typescript`'s TS-aware rules). Adding a `files` key mirrors the pattern already used one block below it for `linebreak-style`, so the fix is a one-line, low-risk change consistent with existing config style.

**Type the two `catch (error: any)` blocks in `AuthContext.tsx` as `AxiosError<{ message?: string }>`** rather than `unknown` + manual narrowing. Both call sites immediately do `error.response?.data?.message`, which is exactly axios's error shape; `useAppMutation.ts` already establishes this same pattern (`error.response?.data as ValidationErrorBody`) elsewhere in the codebase, so this keeps the fix consistent with existing conventions rather than introducing a second style.

**Type `generic-table.tsx`'s `(item as any)[col.key]` as `item[col.key as keyof T]`.** `col.key` is already typed `keyof T | string` on `ColumnConfig<T>` to allow dotted/computed key strings for `render`-only columns; the direct-access fallback path only ever runs for real `keyof T` values in practice, so narrowing the cast to `keyof T` (vs. leaving `any`) is accurate for how the component is used and avoids widening the public `ColumnConfig` type just to satisfy the linter.

**Type `axios.ts`'s `failedQueue` resolve/reject as `(value?: string | null) => void` / `(reason?: AxiosError) => void`.** These match what's actually passed at the two call sites (`processQueue(null, accessToken)` and `processQueue(refreshError as Error, null)` / `prom.resolve(token)`); keep `processQueue`'s own `error: Error | null` param as-is and align the queue entry type to it rather than inventing a broader error union.

## Risks / Trade-offs

- [Risk] Scoping `js.configs.recommended` down could theoretically let a real unused-var/undef bug slip through in a `.ts`/`.tsx` file if `next/typescript` were ever removed from the config. → Mitigation: `next/typescript` (via `next/core-web-vitals`/`next/typescript` extends) already enables `@typescript-eslint/no-unused-vars` for those files, so coverage is preserved, not dropped; this is a scoping fix, not a coverage reduction.
- [Risk] Narrowing `axios.ts` resolve typing to `string | null` could break if a future caller pushes a different token shape into `failedQueue`. → Mitigation: the queue only ever carries the access token string or `null`/errors today; a future change touching this would naturally need to revisit the type anyway.

