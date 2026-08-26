## 1. NavUser prop shape

- [x] 1.1 Update `NavUser`'s `user` prop type in `src/components/nav-user.tsx` to
      `{ phone: string; role?: string }`, replacing the shadcn-starter `{ name, email, avatar }`
      shape.
- [x] 1.2 Update `NavUser`'s JSX to render `user.phone` as the primary line and `user.role` (only
      when present) as secondary text, and always render the `Avatar` fallback (drop `AvatarImage`
      / the `user.avatar` src usage).

## 2. AppSidebar wiring

- [x] 2.1 In `src/components/app-sidebar.tsx`, remove the hardcoded `data.user` object and read
      the current user via `useAuth()` from `AuthContext`.
- [x] 2.2 Pass `{ phone: user.phone, role: user.role }` (guarding for `user` possibly being
      `null`, e.g. render nothing or skip `NavUser` if unauthenticated) into `NavUser` instead of
      `data.user`.

## 3. Verification

- [x] 3.1 Run `pnpm lint` and confirm no new errors.
- [x] 3.2 Manually log in and confirm the sidebar footer shows the real logged-in user's phone
      (and role, if linked to an employee) instead of "shadcn" / "m@example.com", and that the
      avatar shows the fallback rather than a broken image.
