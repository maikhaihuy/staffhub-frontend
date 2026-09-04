## Context

`middleware.ts` runs on every Next.js App Router request (full navigations and the RSC requests
triggered by client-side route changes). It currently gates on `access_token` alone: missing or
expired → `/login`. It never looks at `refresh_token`, so it can't distinguish "no session" from
"session is expired but trivially recoverable." See `proposal.md` - Why for the resulting bug.

Both `access_token` and `refresh_token` are backend-signed JWTs with their own `exp` claim
(confirmed in `staffhub-backend`'s `jwt-token.service.ts`: `generateAccessToken` and
`generateRefreshToken` both call `parseExpirationSeconds`/sign with an `expiresIn`, driven by
separate `JWT_ACCESS_EXPIRATION` / `JWT_REFRESH_EXPIRATION` config). `isTokenExpired` in
`src/lib/utils/jwt.ts` is already generic over any JWT string and fails closed (treats
undecodable/no-`exp` as expired) - it needs no changes to be reused against `refresh_token`.

## Goals / Non-Goals

**Goals:**
- Middleware distinguishes "no recoverable session" (→ `/login`) from "access token expired but
  refresh token still valid" (→ let the request through, or off `/login` to `/`).
- The actual refresh call stays exactly where it is today (axios response interceptor,
  `POST /auth/refresh`, triggered by a real `401`) - middleware makes a routing decision only, it
  never calls the backend itself.

**Non-Goals:**
- Middleware does not perform the refresh call itself (no edge-runtime `fetch('/auth/refresh')`,
  no cookie-writing in the middleware response). That would duplicate the queuing/single-flight
  logic the axios interceptor already owns and would need to run in the Edge runtime against a
  different fetch stack - not worth the duplication for what is fundamentally a routing decision.
- No change to token TTLs, cookie attributes, or the refresh endpoint/body shape.
- No change to `AuthContext`'s in-memory state derivation or the `auth:session-expired` flow -
  those already handle an unrecoverable refresh correctly.

## Decisions

**Decision: middleware lets the request through and defers the actual refresh to the client,
rather than refreshing inline.**
Alternative considered: have middleware call `POST /auth/refresh` itself (via `fetch`, edge
runtime supports it) when it detects an expired-but-refreshable access token, and rewrite the
response's `Set-Cookie` headers before continuing. Rejected because:
- It duplicates the single-flight/queueing logic (`isRefreshing`, `failedQueue`) that already
  lives in `src/lib/api/axios.ts`, now in two places that must stay in sync (edge runtime request
  path vs. Node/browser axios path) with two different HTTP clients (`fetch` vs `axios`).
- Every navigation would cost an extra backend round-trip even when the page's first client-side
  render doesn't need fresh data yet, whereas letting the page load and refresh lazily on its
  first real API call costs nothing extra when, e.g., the page is purely static/cheap.
- The existing interceptor's silent-refresh behavior is already spec'd and tested via API calls;
  reusing that path (by simply not blocking navigation) means zero new refresh code, only a
  routing condition change.

**Decision: reuse `isTokenExpired` against `refresh_token`, not a new "refreshable" helper.**
`isTokenExpired` already fails closed on a malformed/undecodable token or one missing `exp`. That
same failure mode is the correct behavior for `refresh_token` too: if it can't be decoded, treat
the session as unrecoverable and fall back to today's `/login` redirect. No new utility needed.

**Decision: the middleware condition becomes "block only when the session is truly
unrecoverable," not "block whenever anything is expired."**
Concretely: redirect a non-public request to `/login` iff `!access_token`, or (`access_token` is
expired AND (`!refresh_token` OR `refresh_token` is expired)). The public-path
(`/login`)-while-authenticated redirect-to-`/` check gets the mirrored condition: redirect iff a
valid `access_token` exists, OR (`access_token` expired AND `refresh_token` present and valid).

## Risks / Trade-offs

- **[Risk] A page that renders sensitive data via server components (not client-side React Query)
  could momentarily render with a stale/expired access token if it makes its own server-side data
  fetch before any client-side API call triggers a refresh.** → Mitigation: per `CLAUDE.md`'s
  documented data flow (component → feature hook → service → shared axios instance), this
  codebase's data fetching is client-side via React Query hooks over the shared axios instance,
  not server-component fetches with their own auth handling - so this risk is currently
  theoretical. If a server-component data fetch is ever added, it will need to call the backend
  with the current (possibly expired) access token and handle its own `401`, independent of this
  change.
- **[Risk] Letting an expired-access-token request through means the first render of a newly
  navigated page happens before the silent refresh completes**, so the very first API call on that
  page still 401s once before the interceptor recovers it (same as it already does mid-session
  today - this is not a new behavior, just now also reachable via navigation). → Mitigation: none
  needed; this is the existing, already-spec'd recovery path working as designed. React Query's
  retry/loading state absorbs the one extra round trip.
- **[Trade-off] Middleware can no longer assert "this response definitely carries a currently-valid
  access token"** for a `/login`→`/` redirect when only the refresh token is valid - it optimistically
  assumes the client-side refresh will succeed. If the refresh token turns out to be invalid on the
  backend side despite decoding as unexpired locally (e.g. revoked/rotated out from under the
  client), the user briefly reaches `/` before the interceptor's failed-refresh path kicks in and
  bounces them back to `/login` via `auth:session-expired`. This mirrors the already-accepted
  trade-off of trusting a payload-only (unverified-signature) JWT decode in middleware today.

## Migration Plan

No data migration. This is a behavior-only change to `middleware.ts` gated on existing cookies.
Rollback is a plain revert of the middleware condition change; no cookie shape, endpoint, or
schema changes to unwind.
