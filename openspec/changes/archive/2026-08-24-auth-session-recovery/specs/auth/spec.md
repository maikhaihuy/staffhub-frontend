## MODIFIED Requirements

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
The system SHALL NOT call a `/auth/me` endpoint (none exists on the backend). It SHALL instead decode the JWT `accessToken` payload (`sub`, `phone`, optional `role`/`branches`/`empId`) into the current-user object on every login, refresh, and app load. `AuthContext` SHALL also clear this derived user (along with `accessToken`/`refreshToken` state) in response to an `auth:session-expired` event, and SHALL redirect to `/login` carrying the current full path (pathname, query, and hash) as a `returnUrl` query param, so a forced logout from a failed token refresh is reflected in React state rather than only in cookies, and the user can be sent back to where they were.

#### Scenario: User has no linked employee record
- **WHEN** the decoded token omits `role`, `branches`, and `empId`
- **THEN** the system treats the user as authenticated with only `id`/`phone` known, without erroring

#### Scenario: Session expires while the app is mounted
- **WHEN** `AuthContext` receives an `auth:session-expired` event (dispatched after an unrecoverable 401) while the user is on `/schedules/123?date=2026-08-24`
- **THEN** it clears its `user`, `accessToken`, and `refreshToken` state and navigates to `/login?returnUrl=%2Fschedules%2F123%3Fdate%3D2026-08-24` via the router, without requiring a full page reload

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
