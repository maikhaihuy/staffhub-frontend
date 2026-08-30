# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**StaffHub** is a workforce management system for a small milk tea shop. This repository
(package name `berd.em-frontend`) is the **single web app** for Admin, Manager, and Staff —
including the employee self-service experience.

**Scope pivot (2026-08-30):** a separate Zalo Mini App repo was previously planned for the
employee-facing self-service screens (on-shift check-in/check-out, mobile experience). That plan
is **retired** — it was never started, and will not be built as a separate app.
`staffhub-frontend` now covers that role itself, as a plain responsive web app — **no Zalo Mini
App SDK / ZaUI / `zmp-sdk` integration**. Staff open this same web dashboard (on desktop or a
mobile browser) to check in/out, manage tasks, and view earnings. Zalo's only remaining role here
is as an **identity provider** (login / optional account linking) — not a runtime platform.

Primary login for this app is standard backend username/password auth (see Auth below). The
backend (shared with this app) is `staffhub-backend`.

> The "Domain Context", "App Responsibility", "UX Direction", "Screen Specifications", and "Copy &
> Tone" sections below describe the intended product/UX scope, reflecting the 2026-08-30 pivot.
> They are not all necessarily implemented yet — cross-check against the actual route groups and
> features (see Architecture) before assuming a screen exists.

## Commands

- `pnpm dev` — start dev server with Turbopack on port **3016** (not 3000)
- `pnpm build` — production build
- `pnpm start` — run production build
- `pnpm lint` — run ESLint (`next lint`)

There is no test runner configured in this project (no Jest/Vitest, no `test` script).

Package manager is **pnpm** (`pnpm-lock.yaml` is present).

## Architecture

This is a Next.js 15 (App Router) + React 19 + TypeScript frontend, styled with Tailwind CSS v4 and shadcn/ui (`components.json`: style `new-york`, base color `stone`).

### Route groups

- `src/app/(auth)/` — login, register, forgot-password (public pages)
- `src/app/(dashboard)/` — authenticated app: attendanceTracking, branches, employees, my-availabilities, my-calendars, rosters, schedules, shipLogs
- `src/middleware.ts` gates access: any non-public path without an `access_token` cookie redirects to `/login` (with `returnUrl`); an authenticated user hitting a public path is redirected to `/`.

### Feature-module pattern (`src/features/*`)

The codebase is organized by feature, not by layer. Each feature under `src/features/<name>/` follows this internal structure — use it as the template when adding a new feature:

```
<feature>/
  components/   # feature-specific UI (list/detail/form components)
  hooks/        # React Query hooks; index.ts re-exports queries + mutations
  schemas/      # Zod schemas (<feature>.schema.ts)
  services/     # plain async functions calling axios, one per API operation
  types/        # TypeScript types/DTOs for the feature
```

Existing features: `auth`, `branch`, `employee`, `roster`, `schedule`, `shift`, `users`.

Data flow: component → feature hook (`use<Feature>Queries.ts` / `use<Feature>Mutations.ts`) → feature service (`services/*.service.ts`, plain functions) → `src/lib/api/axios.ts` instance. Hooks are built on shared wrappers:

- `src/lib/hooks/common/useAppQuery.ts` — thin wrapper over `useQuery` (1 min `staleTime`, `refetchOnWindowFocus: false`)
- `src/lib/hooks/common/useAppMutation.ts` — wrapper over `useMutation` that auto-toasts success/error (via `sonner`) and can auto-invalidate a query key (`invalidateKey` option)

`src/lib/api/endpoints.ts` centralizes REST paths as a single `API_ENDPOINTS` const object — add new routes there rather than inlining path strings in services.

### Backend status: partially mocked

The backend/Prisma layer was removed from this repo (see git history: "remove prisma and restructure api layer"). Some services still call real endpoints via the shared axios instance; others (e.g. `employee.service.ts`'s `getEmployees`) currently return static data from `src/mocks/data/*.ts` with an artificial `setTimeout` delay instead of hitting the network. When touching a service, check whether it's still mock-backed before assuming API behavior — don't assume a service function reflects a real backend contract.

### Auth (implementation)

- `src/features/auth/context/AuthContext.tsx` (`AuthProvider`/`useAuth`) holds user/token state, wraps the app in `src/app/providers.tsx` (alongside the React Query `QueryClientProvider`), and drives login/register/logout/refresh flows with toast feedback and router redirects.
- Tokens are stored in cookies via `js-cookie` (`tokenManager` in `src/lib/api/axios.ts`), not localStorage, because `middleware.ts` (server-side) can only read cookies.
- The axios instance auto-attaches the `Authorization: Bearer` header and has a response interceptor that transparently refreshes on 401 (queuing concurrent requests while a refresh is in flight) and force-redirects to `/login` on refresh failure.
- `next-auth` is a dependency but the actual auth flow implemented here is the custom cookie/axios-interceptor scheme above — check before assuming NextAuth is wired up.

### State/forms

- Forms: `react-hook-form` + `@hookform/resolvers` + Zod schemas from each feature's `schemas/` folder.
- Global/local UI state: `zustand` where used, otherwise component state or React Query cache.
- Tables: `@tanstack/react-table`.

### Path alias

`@/*` maps to `src/*` (see `tsconfig.json`). `components.json` also defines shadcn aliases (`@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, `@/hooks`).

### package.json leftovers

`package.json` still lists `prisma` as a dependency and a `prisma.seed` script, but there is no `prisma/` directory in the repo — these are stale from before the backend removal.

## Domain Context

StaffHub manages:
- Employees
- Branches
- Schedules
- Shift check-in / check-out
- Mandatory shift tasks
- Todo items
- Delivery receipt submission
- Earnings
- Payroll
- Overtime approval
- Manager approval workflows

### User Roles

| Role | Scope | Uses this app for |
|---|---|---|
| Owner / Admin | Full system access | Full management: users, roles, permissions, branches, schedules, audit log |
| Manager | Branch-level management | Branch-scoped scheduling, employee, and approval screens |
| Staff (Employee) | This app only | Self-service screens (schedule, tasks, income, profile) — desktop or mobile browser |

### Core Business Rules

- `User` is for authentication. `Employee` is for business/domain data.
- `Employee` belongs to a `Branch`.
- Check-in / check-out logs must be preserved. Employees can check out multiple times.
- End-of-day job selects the **final checkout** as the official one.
- **Mandatory tasks** must be completed before checkout is allowed.
- **Todo tasks** can remain pending but must trigger a warning.
- Delivery receipt OCR is a suggestion only; manager must approve the final amount.
- Backend JWT is the source of truth for API calls. **Password login is the primary way this app
  obtains that JWT.** Zalo identity is a secondary, optional link — it never grants access on its
  own.

## Auth (product)

- **Primary: standard username/password login** against the backend, issuing the backend JWT
  (access + refresh pair) used for all API calls, by every role including Staff.
- **Secondary: Zalo account linking** — optional, for Staff who want to log in with Zalo instead
  of remembering a password. Not required to use this app.
- ⚠️ **Known cross-repo dependency**: this depends on backend proposal `make-password-login-primary`
  (adds a `password` field to Users create/update DTOs, restores forgot/reset-password, adds
  authenticated Zalo-linking). Until that lands, Staff accounts effectively need a
  backend-seeded password to log in the standard way.

## App Responsibility

This repo is the **only** frontend — Admin, Manager, and Staff all use it.

✅ Implement:
- Login via standard backend username/password (see Auth above)
- Admin & Manager management screens: users, roles & permissions, branches, employees, schedules,
  rosters, shifts, audit log
- Staff self-service screens (see Screen Specifications below): viewing assigned shifts,
  completing mandatory tasks, viewing/acknowledging todo items, submitting delivery receipts,
  viewing estimated earnings, viewing approval status
- Responsive UI/layouts that work acceptably on both desktop and mobile browsers — Staff screens
  in particular should be designed mobile-first, since most Staff will use a phone browser

❌ Do not implement:
- A separate Zalo Mini App / ZaUI components / `zmp-sdk` — **retired**, not in scope
- Zalo as the *primary* or *only* login method
- Any assumption that Staff access this app only from inside the Zalo app — treat it as a normal
  mobile browser session
- Native-mobile-only interaction patterns (e.g. swipe gestures) where a standard responsive web
  pattern fits better

## UX Direction

- **Responsive, mobile-first for Staff screens; desktop-first for Admin/Manager screens.**
- Simple, friendly, and clear. No enterprise HR wording.
- One clear primary action per screen state.
- Vietnamese user-facing copy throughout.

### Staff's Core Questions (answered at a glance, on the self-service screens)
> Am I working today? · What time is my shift? · Can I check in? · What tasks must I complete? · Can I check out? · How much have I earned? · What is pending approval?

## App Structure — Staff Navigation (4 sections)

Rendered as standard responsive web navigation (bottom tab bar on mobile widths, sidebar/top nav
on desktop widths) — same 4 sections either way:

```
[ Lịch ca ]  [ Nhiệm vụ ]  [ Thu nhập ]  [ Cá nhân ]
```

| Section | Label (VI) | Label (EN) | Milestone |
|---|---|---|---|
| 1 | Lịch ca | Schedule | M1 (Bản biểu) / M2 (Đăng ban, Bản ký) |
| 2 | Nhiệm vụ | Task | M1 (mandatory tasks, check-in/out) / M2 (todo, evidence) |
| 3 | Thu nhập | Income | M3 |
| 4 | Cá nhân | Profile | M2 |

Admin/Manager management screens (users, roles, permissions, branches, audit log, etc.) sit
alongside these as their own navigation section, visible only to those roles — see App
Responsibility above.

## Delivery Roadmap / Milestones (confirmed 2026-08-30)

### M1 — Core attendance loop (MVP)
The minimum for a Staff member to use the app day-to-day. Nothing else in Staff scope ships
before this works end-to-end.
- Login (password)
- Home / "Nhiệm vụ hôm nay": greeting, live clock, shift status, primary action slot
- Check-in / Check-out
- Mandatory tasks (block checkout)
- Lịch ca → **Bản biểu** tab only (view assigned/current shifts, weekly layout, today highlight)

### M2 — Complete the daily-use experience
Not blocking the core loop, but needed before Staff scope feels "done."
- Todo tasks (warn-only at checkout)
- Evidence zone (photo/notes attached to tasks)
- Lịch ca → **Đăng ban** (register available shifts) and **Bản ký** (shift history) tabs
- Cá nhân: view/update personal info, change password, log out

### M3 — Thu nhập (Income), UI-first against mock data
Backend delivery-receipt/OCR/approval model does not exist yet (`add-delivery-receipt-ocr-approval`,
still pre-`design.md`). Decision: **do not block Staff-app UI work on that backend proposal.**
Build the Thu nhập screens now against mocked data, matching the real shape the eventual API is
expected to return (status enum `PENDING_OCR | PENDING_APPROVAL | APPROVED | REJECTED`, separate
`ocrSuggestedAmount` vs `approvedAmount`, etc., per the backend proposal's `DeliveryReceipt`
model) so swapping mocks for the real API later is a data-layer change, not a UI rewrite.
- Tổng quan (Overview): month-to-date estimated earnings breakdown, latest paid amount, pending
  approval summary
- Tiền ca (Shift Earnings): list of completed shifts with earning info
- Tiền ship (Delivery Earnings): list + status of delivery receipts — **mocked**
- Delivery receipt upload flow — **mocked**
- Payroll detail / Previous payroll screens

Mock data for this milestone should live in an isolated service layer (e.g.
`src/features/income/services/*.mock.ts`), following the same pattern already used/cleaned up
elsewhere in this repo (see `remove-dead-roster-schedule-services` — don't repeat that mock/real
split confusion here; keep the mock clearly labeled and swap-ready).

### M4 — Wire M3 to the real backend
Once `add-delivery-receipt-ocr-approval` lands on the backend:
- Replace the mock service layer with real API calls
- Remove mock data files
- Add real error/loading states for OCR-pending / rejection flows that mocks likely
  under-modeled

## Screen Specifications

*(Feature scope unchanged from the original spec — only the platform framing and milestone
ordering above changed.)*

### 1. Lịch ca (Schedule)

Three top tabs, all sharing a **weekly shift layout**:

| Tab | Label (VI) | Purpose | Milestone |
|---|---|---|---|
| 1 | Bản biểu | View assigned / current shifts | M1 |
| 2 | Đăng ban | Register available shifts | M2 |
| 3 | Bản ký | View completed shift history | M2 |

#### Weekly Layout Rules
- Displays days of the week with dates.
- Highlights **today** visually.
- Shows shift periods (e.g., morning / afternoon / evening bands).
- Renders **shift blocks** within the correct period slots.
- Shift blocks support **spanning multiple shift periods**.

#### ShiftBlock Component
- Supports a `title` prop.
- Supports a `children` slot for custom content inside the block.
- Must be reusable across all three tabs (Bản biểu, Đăng ban, Bản ký).

### 2. Nhiệm vụ (Task) — M1 (core) + M2 (todo/evidence)

The task screen is state-driven. Layout slots must remain **positionally consistent** across all states.

#### Time Contexts
- Before shift
- During shift
- Outside shift (no shift today / shift ended)

#### Attendance States
- Not checked in
- Checked in
- Checked out

#### Fixed Layout Slots (consistent across all states)
1. **Greeting** — e.g., "Chào buổi sáng, [Tên]!"
2. **Current time / clock** — live clock display
3. **Shift status** — e.g., "Ca sáng · 07:00 – 15:00"
4. **Primary action** — e.g., Check-in button / Check-out button / disabled state
5. **Task summary** — summary of mandatory + todo task progress

#### Task Types

**Mandatory Tasks** — M1
- Must be completed before checkout is allowed.
- Show completion status clearly.
- Block checkout if any mandatory task is incomplete.

**Todo Tasks** — M2
- Can remain pending.
- Show a warning if any todo task is still pending at checkout time.

#### Evidence Zone — M2
- Allows employee to attach photos and/or notes as evidence for tasks.
- Displayed within the task screen, accessible per task or per shift.

### 3. Thu nhập (Income) — M3, UI-first against mock data (see Milestones above)

Three top tabs:

| Tab | Label (VI) | Purpose |
|---|---|---|
| 1 | Tổng quan | Overview |
| 2 | Tiền ca | Shift Earnings |
| 3 | Tiền ship | Delivery Earnings |

#### Tổng quan (Overview)
- Estimated earning from the **beginning of the current month to now**.
- Earnings breakdown:
  - Shift pay (lương ca)
  - Approved overtime (OT được duyệt)
  - Delivery income (tiền ship)
  - Bonus (thưởng)
- Latest paid amount from the **previous payroll period**.
- Pending approval summary (OT / receipts awaiting manager action).
- Entry points to: Payroll detail screen · Previous payroll screen.

#### Tiền ca (Shift Earnings)
- List of completed shifts with earning info per shift.

#### Tiền ship (Delivery Earnings)
- List of delivery orders / submitted receipts.
- Status of each receipt (pending OCR, pending approval, approved, rejected).
- **Mocked in M3** — see Milestones section for the expected data shape to mock against.

### 4. Cá nhân (Profile) — M2

- View and update personal information.
- Change password.
- Log out.

## Zalo Integration (secondary — identity only, not a runtime platform)

- This app's login screen is **standard username/password** (see Auth above).
- Zalo identity linking is optional; it exists to let Staff log in with Zalo instead of a
  password, if they prefer.
- **Backend remains the source of truth**, regardless of login method.
- All API calls use the **backend-issued JWT**, however it was obtained.
- No Zalo Mini App SDK, ZaUI components, or Zalo-specific runtime APIs (camera, location, etc. via
  `zmp-sdk`) are used anywhere in this repo. If a Staff screen needs camera access (e.g. evidence
  photo upload, delivery receipt upload), use standard browser APIs (`<input type="file"
  capture>`), not the Zalo SDK.

## Important Screens (Full List)

**Admin / Manager:**
- Users, roles & permissions management
- Branches, employees management
- Schedules, rosters, shift templates
- Audit log

**Staff self-service:**
- Home / Today shift — M1
- Schedule — Bản biểu (M1), Đăng ban / Bản ký (M2)
- Shift detail — M1
- Check-in / Check-out — M1
- Mandatory tasks — M1
- Todo list — M2
- Evidence zone — M2
- Earnings overview (Tổng quan) — M3, mocked
- Shift earnings (Tiền ca) — M3, mocked
- Delivery earnings (Tiền ship) — M3, mocked
- Delivery receipt upload — M3, mocked
- Payroll detail — M3, mocked
- Previous payroll — M3, mocked
- Profile — M2

**Retired — not building:**
- A separate Zalo Mini App repo/build for any of the above. This app covers Staff self-service
  directly.

## Copy & Tone Guidelines

- Language: **Vietnamese** for all user-facing text.
- Tone: Simple, warm, approachable. Like a friendly team lead, not an HR system.
- Avoid: "Submit attendance", "Log timekeeping entry", "Compensation period".
- Prefer: "Chấm công", "Vào ca", "Kết ca", "Ca hôm nay", "Tiền của bạn".
