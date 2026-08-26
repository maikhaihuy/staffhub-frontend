# auth Specification

## Purpose

Authenticates users against the real backend via a phone/password login, persists JWTs in cookies so both client and server (middleware) can read them, and transparently refreshes expired access tokens.

## Requirements

### Requirement: Login issues and persists tokens
The system SHALL authenticate a user via `POST /auth/login` with `username`/`password`, and on success SHALL persist the returned `accessToken`/`refreshToken` in cookies (not localStorage), so `middleware.ts` can read them server-side. On success, the system SHALL redirect to the `returnUrl` query param only if it is a safe, same-origin relative path (not an absolute URL, protocol-relative URL, or any other external destination); otherwise it SHALL redirect to `/`.

#### Scenario: Successful login
- **WHEN** a user submits valid phone/password credentials
- **THEN** the system stores `access_token`/`refresh_token` cookies and redirects to the `returnUrl` query param, or `/` if absent

#### Scenario: Successful login with a malicious returnUrl
- **WHEN** a user submits valid credentials and the `returnUrl` query param is an absolute or protocol-relative URL (e.g. `https://malicious-site.com` or `//malicious-site.com`)
- **THEN** the system ignores that value and redirects to `/` instead of following it

#### Scenario: Invalid credentials
- **WHEN** login fails
- **THEN** the system shows a toast with the backend's error message and does not persist any tokens

### Requirement: Current user is derived from the access token
The system SHALL NOT call a `/auth/me` endpoint (none exists on the backend). It SHALL instead decode the JWT `accessToken` payload (`sub`, `phone`, optional `role`/`branches`/`empId`) into the current-user object on every login, refresh, and app load. The system SHALL NOT persist this derived user object in `localStorage` or any other persistent client-side storage; it SHALL be held only in memory (React state) for the lifetime of the page, and re-derived from the access token cookie on every app load. `AuthContext` SHALL also clear this derived user (along with `accessToken`/`refreshToken` state) in response to an `auth:session-expired` event, and SHALL redirect to `/login` carrying the current full path (pathname, query, and hash) as a `returnUrl` query param, so a forced logout from a failed token refresh is reflected in React state rather than only in cookies, and the user can be sent back to where they were.

#### Scenario: User has no linked employee record
- **WHEN** the decoded token omits `role`, `branches`, and `empId`
- **THEN** the system treats the user as authenticated with only `id`/`phone` known, without erroring

#### Scenario: Session expires while the app is mounted
- **WHEN** `AuthContext` receives an `auth:session-expired` event (dispatched after an unrecoverable 401) while the user is on `/schedules/123?date=2026-08-24`
- **THEN** it clears its `user`, `accessToken`, and `refreshToken` state and navigates to `/login?returnUrl=%2Fschedules%2F123%3Fdate%3D2026-08-24` via the router, without requiring a full page reload

#### Scenario: App reload with a valid session
- **WHEN** the app loads (or reloads) and a valid, unexpired `access_token` cookie is present
- **THEN** the system decodes the current user from that cookie's token and does not read any previously stored user object from `localStorage`

#### Scenario: No user object in persistent storage
- **WHEN** a user is logged in, whether just after login or after a page reload
- **THEN** `localStorage` contains no decoded user object at any key

### Requirement: Auth cookies use hardened attributes
The system SHALL set the `access_token` and `refresh_token` cookies with `SameSite=Strict` on every write (login, register, and refresh), and SHALL additionally set `Secure` when running in a production build. On logout or an unrecoverable 401, the system SHALL remove both cookies.

#### Scenario: Cookies set in production
- **WHEN** the system persists `access_token`/`refresh_token` after login, register, or refresh in a production build
- **THEN** both cookies are set with `Secure` and `SameSite=Strict`

#### Scenario: Cookies set in local development
- **WHEN** the system persists `access_token`/`refresh_token` after login, register, or refresh in a non-production (local dev) build served over plain HTTP
- **THEN** both cookies are set with `SameSite=Strict` and without `Secure`, so they still work over HTTP on localhost

#### Scenario: Logout clears cookies
- **WHEN** the user logs out, or the system receives an unrecoverable 401 (no refresh token, or the refresh call fails)
- **THEN** both `access_token` and `refresh_token` cookies are removed

### Requirement: Expired access tokens are refreshed transparently
The system SHALL intercept any `401` response, attempt exactly one `POST /auth/refresh` using the stored refresh token, and retry the original request with the new access token. Concurrent requests that 401 while a refresh is already in flight SHALL be queued and retried once the refresh completes, rather than each triggering their own refresh call. When no refresh is possible (no stored refresh token) or the refresh call itself fails, the system SHALL clear stored tokens and broadcast a client-side `auth:session-expired` event rather than redirecting directly, so `AuthContext` can own clearing its in-memory state and navigating to `/login`.

#### Scenario: Single request hits 401
- **WHEN** any authenticated request returns 401 and no refresh is already in progress
- **THEN** the system refreshes the token once and retries the original request with the new token

#### Scenario: Multiple requests hit 401 simultaneously
- **WHEN** several requests 401 while a refresh is already in flight
- **THEN** only one refresh call is made; all queued requests retry with the token it returns

#### Scenario: No refresh token available
- **WHEN** a request returns 401 and there is no stored refresh token
- **THEN** the system clears stored tokens and dispatches an `auth:session-expired` window event, without itself performing a redirect

#### Scenario: Refresh itself fails
- **WHEN** `POST /auth/refresh` fails (e.g. refresh token expired/invalid)
- **THEN** the system clears stored tokens and dispatches an `auth:session-expired` window event, without itself performing a redirect

### Requirement: Refresh request body includes both key casings
The backend's refresh-token strategy reads `refresh_token` (snake_case) from the request body while its validated DTO expects `refreshToken` (camelCase). The system SHALL send both keys with the same value on every refresh/logout call until the backend is reconciled to accept one.

#### Scenario: Refresh call
- **WHEN** the system calls `POST /auth/refresh` or `POST /auth/logout`
- **THEN** the request body includes both `refreshToken` and `refresh_token` set to the same value

### Requirement: Unauthenticated access to protected routes is blocked server-side
`middleware.ts` SHALL redirect any request to a non-public path that lacks an `access_token` cookie to `/login`, carrying the original path and query string as a `returnUrl` query param. An authenticated user (has `access_token`) hitting a public path (e.g. `/login`) SHALL be redirected to `/`.

#### Scenario: Anonymous user requests a dashboard page
- **WHEN** a request has no `access_token` cookie and targets a non-public path
- **THEN** the response redirects to `/login?returnUrl=<original-path>`

#### Scenario: Anonymous user requests a dashboard page with query parameters
- **WHEN** a request has no `access_token` cookie and targets `/schedules/123?date=2026-08-24`
- **THEN** the response redirects to `/login?returnUrl=%2Fschedules%2F123%3Fdate%3D2026-08-24`, preserving the query string

#### Scenario: Authenticated user requests the login page
- **WHEN** a request has an `access_token` cookie and targets `/login`
- **THEN** the response redirects to `/`
