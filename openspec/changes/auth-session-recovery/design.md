## Context

The transparent-refresh mechanism (401 detection, single in-flight refresh via `isRefreshing`/`failedQueue`, retry with `_retry` guard) already lives in `src/lib/api/axios.ts` and matches Requirement 1 in full — see `openspec/specs/auth/spec.md` ("Expired access tokens are refreshed transparently"). It is out of scope here; see proposal.md - Why.

Two `returnUrl` producers/consumers exist today and disagree on shape:
- `middleware.ts` (edge runtime, no `window`) builds `returnUrl` from `request.nextUrl.pathname` only — drops the query string.
- `AuthContext`'s `auth:session-expired` handler (browser runtime) currently builds no `returnUrl` at all — it just `router.push('/login')`.
- `AuthContext.login` reads `searchParams.get('returnUrl')` and calls `router.push(returnUrl)` unconditionally — no validation, so a `returnUrl` of `https://evil.example` would be followed.

## Goals / Non-Goals

**Goals:**
- One shared notion of "what does a safe `returnUrl` look like" used by every place that reads one back (currently only `AuthContext.login`).
- Both `returnUrl` producers (middleware, session-expired handler) emit that same shape: path + query + hash, URL-encoded as a single query param value.
- No behavior change to the axios refresh/retry/queue logic.

**Non-Goals:**
- No change to how tokens are stored, decoded, or refreshed.
- No new auth mechanism, no server-side session store, no change to `middleware.ts`'s allow/deny logic beyond the `returnUrl` string it builds.
- Not building a general-purpose URL-safety library — just enough to cover same-origin relative paths for this app's routes.

## Decisions

**A single client-side helper, `isSafeReturnUrl` (+ a `buildReturnUrl` for producers), in `src/lib/utils/returnUrl.ts`.**
`AuthContext` (both the login consumer and the session-expired producer) runs in the browser, so it can share one module. `middleware.ts` runs on the edge runtime where `window`/`URL` parsing from a relative string still works the same way (edge runtime supports the standard `URL`/`URLSearchParams` globals), so it can import the same helper rather than re-implementing the check — avoiding a second, possibly-drifting definition of "safe". Alternative considered: duplicate a tiny inline check in middleware to avoid any cross-runtime import risk — rejected because the proposal explicitly calls for not duplicating logic, and the helper has zero Node-only dependencies (pure string/URL parsing), so it's safe to share.

**Safety rule: reject anything that isn't a path starting with a single `/`.**
Concretely: reject values that parse as absolute URLs (`https://...`), protocol-relative URLs (`//evil.example`), and anything not starting with exactly one `/` (e.g. `/\evil.example` style tricks some browsers normalize as protocol-relative). Accept a leading `/` followed by any path/query/hash. This matches the "internal routes only" requirement without needing an allowlist of known routes (the app's route set changes independently of this helper, and an allowlist would need maintenance every time a route is added).

**`auth:session-expired` handler captures `window.location.pathname + search + hash` at the moment it fires, not a value cached earlier.**
The event fires from the axios interceptor at the moment a request unrecoverably 401s, which is when the user's current route is authoritative. Reading `window.location` synchronously in the handler (browser-only code, same as the rest of `AuthContext`) avoids threading the "current path" through props/context from elsewhere.

**Middleware builds its own encoded `returnUrl` string inline rather than importing a Node-targeting helper for the producer side.**
`buildReturnUrl` exported from the shared module is pure (`(pathname, search, hash) => string`) with no runtime-specific APIs, so both middleware and `AuthContext` can call the same function — middleware passes `request.nextUrl.pathname`/`.search` (no hash available server-side, which is expected: hashes never reach the server), `AuthContext` passes `window.location.pathname`/`.search`/`.hash`.

## Risks / Trade-offs

- [Risk] A future route could legitimately need an external redirect (e.g. SSO) and this helper would block it. → Not a current requirement; if it arises, extend the helper with an explicit allowlist rather than loosening the default-deny rule.
- [Risk] `encodeURIComponent`-ing the full path+query+hash into a single `returnUrl` param produces long, opaque URLs for deeply-nested routes with many query params. → Acceptable; this matches the existing middleware behavior and the example in the proposal (`/login?returnUrl=%2Fschedules%2F123%3Fdate%3D2026-08-24`).
- [Risk] Edge runtime and browser both implement `URL`, but subtly different parsing edge cases (e.g. backslash normalization) have historically differed across engines. → Mitigate by testing the helper's reject-list against known bypass patterns (`//`, `/\`, `\/\/`) rather than relying solely on `new URL()` throwing.

## Migration Plan

No data migration. This is a behavior-only change to three files (`AuthContext.tsx`, `middleware.ts`, new `returnUrl.ts`); ship as a single change. No feature flag needed — the new `returnUrl` handling is strictly additive (session-expired redirects now carry a param they previously omitted) or corrective (login now validates a param it previously trusted blindly). Rollback is a plain revert.
