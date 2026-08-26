_Priority: high, quick fix_

## Why
`src/components/app-sidebar.tsx` hardcodes a demo user object
(`data.user = { name: "shadcn", email: "m@example.com", avatar: "/avatars/shadcn.jpg" }`) and
passes it straight into `NavUser`, which never reads `AuthContext` for display (only for the
logout action). Every real, logged-in user currently sees this fake profile in their own
sidebar footer — a visible, confusing bug, not a cosmetic nit.

Note: `AuthUser` (`src/features/auth/types/auth.type.ts`) — derived from the decoded JWT, since
there is no `/auth/me` endpoint — only exposes `id`, `phone`, `role`, `branches`, `employeeId`.
There is no `name`, `email`, or `avatar` field anywhere in the auth system today, so the fix
displays `phone` (with `role` as secondary text) and always renders the avatar fallback, rather
than pretending a name/email/avatar exists.

## What Changes
- Replace the hardcoded `data.user` with the current user from `AuthContext`: show `phone` as the
  primary identity line and `role` (when present) as secondary text, and always render the
  `NavUser` avatar fallback (no avatar field exists on `AuthUser`).
- Widen `NavUser`'s `user` prop shape to match what's actually available (`phone`, `role?`)
  instead of the shadcn-starter `{ name, email, avatar }` shape.

## Capabilities
- `sidebar-user-identity` (new) — the sidebar footer displaying the authenticated user's own
  identity, sourced from `AuthContext` rather than a static placeholder.

## Impact
`src/components/app-sidebar.tsx`, `src/components/nav-user.tsx`.
