## MODIFIED Requirements

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

## ADDED Requirements

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
