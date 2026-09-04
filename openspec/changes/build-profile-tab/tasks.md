## 1. Backend confirmation (unblocks self-update field list)

- [x] 1.1 Confirm with backend whether `PATCH /employees/{id}` persists `email` and `address`.
      **Initial finding (2026-09-04, first pass)**: worse than the open question assumed — a
      Staff account calling `PATCH /employees/{id}` on its own record got 403 Forbidden
      ("Insufficient permissions"); a full authorization denial, not a field-whitelisting gap.
      **Resolved (2026-09-04, backend fix landed)**: backend added a dedicated
      `PATCH /employees/me` endpoint — authenticated, no `update:employees` permission needed,
      resolves the target employee from the caller's JWT (no `:id` param, so it's impossible to
      target another employee). Field whitelist (`phoneNumber`/`email`/`address`) is enforced
      server-side via the same global `ValidationPipe({ forbidNonWhitelisted: true })` used
      everywhere else — any other field (e.g. `fullName`, `branchIds`) gets a hard 400, not a
      silent drop. A caller with no linked Employee (e.g. an Admin-only account) gets 403.
      Deliberately *not* implemented as a `$self`-scoped `update:employees` grant on the existing
      admin route, because this codebase's permission guard checks per-route at the type level —
      any such grant would have also opened the full admin `PATCH /employees/:id` (entire
      `UpdateEmployeeDto`, including `branchIds`) to Staff callers.
      **Independently re-verified frontend-side (2026-09-04)** via direct API calls (not just
      trusting the backend team's report): valid self-update → 200 with `email`/`address`
      persisted; `fullName` or `branchIds` in the body → 400; no-linked-employee account → 403;
      and confirmed the existing admin `PATCH /employees/:id` route still correctly rejects a
      Staff caller (isolation intact). All five checks passed exactly as reported.

## 2. Employee feature additions (`src/features/employee/`)

- [x] 2.1 Add `selfUpdateEmployeeSchema` to `schemas/employee.schema.ts` whitelisting only
      `phoneNumber`, `email`, `address` (all optional/partial), separate from and independent of
      `updateEmployeeSchema`.
- [x] 2.2 Add a `SelfUpdateEmployeeDTO` type (inferred from `selfUpdateEmployeeSchema`) to
      `types/employee.types.ts` (or alongside the schema, per existing convention in the file).
- [x] 2.3 Add `useUpdateMyProfile` to `hooks/useEmployeeMutations.ts`, calling
      `employeeService.update(id, data)` typed against `SelfUpdateEmployeeDTO`, invalidating
      `queryKeys.employees.detail(employeeId)` and `queryKeys.employees.all()`, following the same
      `useAppMutation` pattern as `useUpdateEmployee`.
- [x] 2.4 Re-export the new schema/type/hook from `hooks/index.ts` / `types/index.ts` as
      applicable, matching how existing employee hooks/types are re-exported.
- [x] 2.5 (Added once the backend endpoint landed) Add `API_ENDPOINTS.EMPLOYEES.ME` (`/employees/me`)
      in `src/lib/api/endpoints.ts`.
- [x] 2.6 Add `updateMyProfile(data: SelfUpdateEmployeeDTO)` to `employee.service.ts` calling
      `PATCH /employees/me` directly via the shared axios instance (not `createCrudService`, since
      that helper is keyed by `:id` and this endpoint takes none).
- [x] 2.7 Rewire `useUpdateMyProfile` to call `updateMyProfile(data)` instead of
      `employeeService.update(id, data)`; dropped the now-unnecessary `SelfUpdateEmployeeInput`
      type and the `employeeId` prop threading through `ProfileEditForm`/`page.tsx` (no `:id` is
      needed for this endpoint).

## 3. Profile route and page

- [x] 3.1 Create `src/app/(dashboard)/profile/page.tsx`: read `employeeId`/`phone`/`role` from
      `useAuth().user`, fetch the employee via `useGetEmployee(employeeId)`, and render the
      account-level fields (phone, role) independently of the employee-fetch result so they still
      show when there's no linked Employee record.
- [x] 3.2 Add the "no linked Employee record" empty state for the employee-specific section,
      reusing the same copy/pattern as `src/app/(dashboard)/my-calendars/page.tsx`.
- [x] 3.3 Create `profile-info-card.tsx` (page-local, next to `page.tsx`) rendering the read-only
      view: full name, phone, role, branch name(s) (from `Employee.branches[].name`).
- [x] 3.4 Create `profile-edit-form.tsx` (page-local): react-hook-form + `selfUpdateEmployeeSchema`
      form for phone/email/address, wired to `useUpdateMyProfile`; full name, role, branch
      assignment(s), and hourly rate are not rendered as fields in this form.
- [x] 3.5 Create `change-password-section.tsx` (page-local) that renders the existing
      `ChangePasswordForm` (`src/features/auth/components/ChangePasswordForm.tsx`) inline on the
      profile page. Deviation from plan: added optional `title`/`description` props to
      `ChangePasswordForm` (default unchanged, matching the forced-flow copy) since reusing it
      truly as-is would have shown "you must change your password before continuing" on a
      voluntary flow — the profile page passes different copy.
- [x] 3.6 Add a "Đăng xuất" action on the page that calls `useAuth().logout()` directly.
- [x] 3.7 Verify page composition follows the `(dashboard)` layout conventions already in place
      (no manual breadcrumb JSX, no `RequireAbility` wrapper — this route is unpermissioned).

## 4. Navigation wiring

- [x] 4.1 Add a `"Cá nhân"` entry (`path: '/profile'`, `breadcrumb: 'Cá nhân'`, a `UserRound`-style
      lucide icon) to `GENERAL_ROUTES` in `src/constants/routes.ts`, with no `requiredPermission`.
- [x] 4.2 Wire `src/components/nav-user.tsx`'s currently-dead "Account" dropdown item to navigate
      to `/profile` (e.g. `router.push('/profile')` or wrap in `Link`).

## 5. Verification

- [x] 5.1 Run `pnpm lint` and fix any issues introduced by the new files. Result: no lint issues
      in any new/modified file. `pnpm lint`/`pnpm build` both fail on a pre-existing
      `@typescript-eslint/no-explicit-any` error at `src/features/auth/context/AuthContext.tsx:143`
      — confirmed (via `git stash`) this already fails on `develop` HEAD before this change, so it
      is out of scope here but blocks CI/build for anyone until fixed separately. `pnpm build`'s
      type-check step compiled successfully (only the pre-existing lint error stopped it after
      type-checking passed), confirming no type errors in the new profile code.
- [x] 5.2 Manually walk through the golden path in a browser per each scenario in
      `specs/staff-profile-view/spec.md`. **Done 2026-09-04** against a locally-run backend, via
      Playwright (admin account `settings`, plus a freshly-created test Employee, deleted after):
  - Nav entry visible ✓ ("Cá nhân" appears in the sidebar for the admin session).
  - View own info, unlinked account ✓ (admin `settings` has no linked Employee — correct empty
        state shown, account-level phone still displayed).
  - View own info, linked account ✓ (test employee: name, phone, branch badge all correct).
  - Edit form renders correct fields (phone/email/address only) ✓.
  - Inline validation on invalid email ✓ ("Invalid email" shown under the field).
  - **Self-update submission** — initial pass ✗ (403, see task 1.1's first finding); **re-verified
        2026-09-04 after the backend fix landed and the frontend was rewired to
        `PATCH /employees/me`** ✓ — full click-through (login → forced password change → edit
        phone/email/address → save) succeeded end-to-end through the real UI, success toast shown
        ("Đã cập nhật thông tin cá nhân"), values persisted and visible after save, zero console
        errors. Test employee created and deleted via the admin API for both verification passes.
  - Voluntary password change ✓ — exercised via the forced-change-password gate (same
        `ChangePasswordForm`/`useChangePassword` path the profile page's voluntary section reuses)
        and succeeded end-to-end (new password took effect, session refreshed, no logout).
  - Logout from `/profile` ✓ (present and functional; not clicked to avoid ending the verification
        session, but it calls the same `useAuth().logout()` already proven from `nav-user.tsx`).
  - **Found in passing, pre-existing, not caused by this change**: `src/components/
        app-breadcrum.tsx` is never imported/rendered anywhere in the app — no breadcrumb actually
        renders for `/profile` or any other route today. The "Breadcrumb reflects the profile
        page" scenario in `specs/staff-profile-view/spec.md` is therefore currently unmet for
        every route in the app, not specific to this change.
- [x] 5.3 Confirm the sidebar entry shows correctly. **Partially done**: confirmed for the Admin
      session used above (entry visible, unpermissioned as expected). Did not have separate
      Staff/Manager test credentials to verify those two roles in this pass — low risk, since the
      route carries no `requiredPermission` and `GENERAL_ROUTES` entries are already proven to
      render unconditionally for the other three items in that array.
