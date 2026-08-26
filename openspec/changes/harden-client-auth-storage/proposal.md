_Priority: medium_

## Why
Auth tokens are stored via `js-cookie` with no `Secure` or `SameSite` set (a
`secure: true khi production` comment was never implemented), and the decoded user object is
stored in `localStorage` in plaintext. Combined with proposal A's page-gating gap, an XSS on any
single page would be enough to read a live session and its associated user data.

## What Changes
- Set `Secure` (in production) and `SameSite=Strict` (or `Lax` if a cross-site redirect flow
  requires it — verify against the Zalo/login redirect flow first) on the auth cookies in
  `src/lib/api/axios.ts`'s `tokenManager`.
- Stop storing the full decoded user object in `localStorage`; keep it in memory
  (React context/state) and re-derive from the access token on reload instead, consistent with
  how `auth.service.ts` already does `userFromAccessToken`.

## Capabilities
(none — hardening, no new capability)

## Impact
`src/lib/api/axios.ts`, `src/features/auth/context/AuthContext.tsx`,
`src/features/auth/services/auth.service.ts`.
