# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

### Auth

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
