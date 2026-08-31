## 1. ESLint config scoping (fixes the bulk of false-positive errors)

- [x] 1.1 In `eslint.config.mjs`, move `js.configs.recommended` out of the top-level array and into a config object scoped with `files: ["**/*.js", "**/*.mjs"]` (mirroring the existing `linebreak-style` block), so core `no-unused-vars`/`no-undef` no longer run against `.ts`/`.tsx` files.
- [x] 1.2 Run `pnpm lint` and confirm all `no-unused-vars`/`no-undef` errors are gone from: `drawer-form.tsx`, `generic-table.tsx` (unused-vars only), `page-navigator.tsx`, `sidebar.tsx`, `skeleton.tsx`, `sonner.tsx`, `spinner.tsx`, `appSwitcherUrls.ts`, `auth.type.ts`, `branch/components/form.tsx`, `employee/components/form.tsx`, `masterShiftTemplate/components/form.tsx`, `subShiftTemplate/components/sub-shift-template-form.tsx`, `users/components/form.tsx`, `axios.ts` (unused-vars only), `useAppMutation.ts`.
- [x] 1.3 (Discovered during 1.2) Scoping away the core rule made 11 pre-existing `// eslint-disable-next-line no-unused-vars` comments elsewhere dead (flagged as "Unused eslint-disable directive" warnings). Removed the now-unused directive lines/rule names across those 11 files plus `useAppMutation.ts` (which kept its still-needed `@typescript-eslint/no-explicit-any` directive).

## 2. Fix genuine `@typescript-eslint/no-explicit-any` errors

- [x] 2.1 `src/components/shared/generic-table.tsx:54` — change `(item as any)[col.key]` to `item[col.key as keyof T] as React.ReactNode` (a bare `keyof T` cast alone still failed `tsc`'s stricter project-wide check for unconstrained generic `T`, even though ESLint accepted it — added the `ReactNode` cast to satisfy `pnpm run build`'s type-check pass too).
- [x] 2.2 `src/features/auth/context/AuthContext.tsx:105,121` — change both `catch (error: any)` to `catch (error) { const axiosError = error as AxiosError<{ message?: string }>; ... }` (imported `AxiosError` from `axios`), keeping the existing `error.response?.data?.message` access.
- [x] 2.3 `src/lib/api/axios.ts:47,48` — change `failedQueue`'s entry type from `{ resolve: (value?: any) => void; reject: (reason?: any) => void }` to `{ resolve: (value?: string | null) => void; reject: (reason?: Error) => void }` (used `Error`, not `AxiosError`, to match `processQueue`'s actual `error: Error | null` parameter type — design.md's `AxiosError` choice would have been a type error at the `prom.reject(error)` call site).
- [x] 2.4 Run `pnpm lint` and confirm zero `@typescript-eslint/no-explicit-any` errors remain.

## 3. Fix pre-existing warnings surfaced in the same build output

- [x] 3.1 `src/app/(auth)/login/loginForm.tsx:76` — replace the raw `<img src="/login.svg" ... />` with `next/image`'s `<Image />` (`fill` + the existing className, since it's positioned `absolute inset-0` inside a sized container).
- [x] 3.2 `src/app/(dashboard)/my-availabilities/[id]/page.tsx:27-33` — wrap `const branches = employee?.branches ?? []` in `useMemo(() => employee?.branches ?? [], [employee?.branches])` so the `useEffect` on line 29 gets a stable dependency.

## 4. Additional pre-existing `pnpm run build` blockers (surfaced only once lint/type errors above were cleared)

These were hidden behind the ESLint failure and are unrelated to it, but `pnpm run build` didn't reach a working state without fixing them too. User confirmed both fixes before they were made.

- [x] 4.1 `src/app/(auth)/forgot-password/page.tsx` was a 0-byte file ("not a module" `tsc` error), yet the route is linked from `LoginForm.tsx`/`RegisterForm.tsx` and listed in `middleware.ts`'s public paths. Added a minimal placeholder page (Vietnamese copy, matches the existing Card-based auth page style) explaining the feature isn't available yet, per CLAUDE.md's note that forgot/reset-password is blocked on the backend's `make-password-login-primary` proposal.
- [x] 4.2 `AuthContext.tsx`'s `AuthProvider` called `useSearchParams()` directly; since it wraps the whole app in `providers.tsx`/root layout, this broke static prerendering for every route (`useSearchParams() should be wrapped in a suspense boundary`). Extracted the hook into a small `ReturnUrlSync` child component wrapped in `<Suspense fallback={null}>` inside `AuthProvider`, syncing the latest `URLSearchParams` into a ref that `login()` reads from — same runtime behavior, no more CSR bailout.

## 5. Verify

- [x] 5.1 Run `pnpm lint` — zero errors, zero warnings.
- [x] 5.2 Run `pnpm run build` — completes successfully (exit code 0, all 22 routes generated).
- [x] 5.3 Smoke-checked in a real browser (Playwright): `/login`, `/forgot-password`, and `/my-availabilities/1` (redirects to `/login?returnUrl=...` when unauthenticated, as expected) all render with zero console errors. Logging in from the `returnUrl`-carrying login page correctly redirects to `/my-availabilities/1` afterward and the page renders its data — confirms the `ReturnUrlSync`/Suspense refactor preserves the original returnUrl behavior and the `useMemo` branches fix didn't break data loading.
