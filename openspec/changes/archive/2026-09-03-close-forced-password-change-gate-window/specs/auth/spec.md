## MODIFIED Requirements

### Requirement: Login issues and persists tokens
The system SHALL authenticate a user via `POST /auth/login` with `username`/`password`, and on success SHALL persist the returned `accessToken`/`refreshToken` in cookies (not localStorage), so `middleware.ts` can read them server-side. On success, the system SHALL resolve the `returnUrl` query param to a destination, accepting it only if it is a safe, same-origin relative path (not an absolute URL, protocol-relative URL, or any other external destination) and falling back to `/` otherwise. The system SHALL then check the decoded access token's `mustChangePassword` claim: when it is true, the system SHALL navigate to `/change-password` carrying the resolved destination as a `returnUrl` query param instead of navigating to it directly; otherwise it SHALL navigate to the resolved destination.

#### Scenario: Successful login
- **WHEN** a user submits valid phone/password credentials and the issued token does not carry `mustChangePassword: true`
- **THEN** the system stores `access_token`/`refresh_token` cookies and redirects to the `returnUrl` query param, or `/` if absent

#### Scenario: Successful login by a user who must change their password
- **WHEN** a user submits valid credentials and the issued access token carries `mustChangePassword: true`
- **THEN** the system stores the token cookies and redirects to `/change-password`, carrying the resolved destination as a `returnUrl` query param, rather than to that destination

#### Scenario: Successful login with a malicious returnUrl
- **WHEN** a user submits valid credentials and the `returnUrl` query param is an absolute or protocol-relative URL (e.g. `https://malicious-site.com` or `//malicious-site.com`)
- **THEN** the system ignores that value and redirects to `/` instead of following it

#### Scenario: Invalid credentials
- **WHEN** login fails
- **THEN** the system shows a toast with the backend's error message and does not persist any tokens

### Requirement: Current user is derived from the access token
The system SHALL NOT call a `/auth/me` endpoint (none exists on the backend). It SHALL instead decode the JWT `accessToken` payload (`sub`, `phone`, optional `role`/`branches`/`empId`/`mustChangePassword`) into the current-user object on every login, refresh, and app load. A token that omits `mustChangePassword` SHALL be treated as not flagged. The system SHALL NOT persist this derived user object in `localStorage` or any other persistent client-side storage; it SHALL be held only in memory (React state) for the lifetime of the page, and re-derived from the access token cookie on every app load. `AuthContext` SHALL also clear this derived user (along with `accessToken`/`refreshToken` state) in response to an `auth:session-expired` event, and SHALL redirect to `/login` carrying the current full path (pathname, query, and hash) as a `returnUrl` query param, so a forced logout from a failed token refresh is reflected in React state rather than only in cookies, and the user can be sent back to where they were. `AuthContext` SHALL additionally listen for an `auth:password-change-required` event and redirect to `/change-password` carrying the current full path as a `returnUrl`, without clearing any auth state, since that session is valid and merely gated.

#### Scenario: User has no linked employee record
- **WHEN** the decoded token omits `role`, `branches`, and `empId`
- **THEN** the system treats the user as authenticated with only `id`/`phone` known, without erroring

#### Scenario: Token carries the must-change-password claim
- **WHEN** the decoded token includes `"mustChangePassword": true`
- **THEN** the derived user object carries `mustChangePassword: true`, and when the claim is absent the derived user is treated as not flagged

#### Scenario: Session expires while the app is mounted
- **WHEN** `AuthContext` receives an `auth:session-expired` event (dispatched after an unrecoverable 401) while the user is on `/schedules/123?date=2026-08-24`
- **THEN** it clears its `user`, `accessToken`, and `refreshToken` state and navigates to `/login?returnUrl=%2Fschedules%2F123%3Fdate%3D2026-08-24` via the router, without requiring a full page reload

#### Scenario: Password change is demanded while the app is mounted
- **WHEN** `AuthContext` receives an `auth:password-change-required` event (dispatched after a `PASSWORD_CHANGE_REQUIRED` 403) while the user is on `/schedules/123?date=2026-08-24`
- **THEN** it navigates to `/change-password?returnUrl=%2Fschedules%2F123%3Fdate%3D2026-08-24` and leaves `user`, `accessToken`, and `refreshToken` state and both cookies intact

#### Scenario: App reload with a valid session
- **WHEN** the app loads (or reloads) and a valid, unexpired `access_token` cookie is present
- **THEN** the system decodes the current user from that cookie's token and does not read any previously stored user object from `localStorage`

#### Scenario: No user object in persistent storage
- **WHEN** a user is logged in, whether just after login or after a page reload
- **THEN** `localStorage` contains no decoded user object at any key

### Requirement: Unauthenticated access to protected routes is blocked server-side
`middleware.ts` SHALL redirect any request to a non-public path that lacks an `access_token` cookie, or whose `access_token` is expired, to `/login`, carrying the original path and query string as a `returnUrl` query param. An authenticated user (has a valid `access_token`) hitting a public path (e.g. `/login`) SHALL be redirected to `/`. After those rules, and only for a request carrying a valid unexpired token, `middleware.ts` SHALL decode that token and, when its `mustChangePassword` claim is true, redirect any path other than `/change-password` to `/change-password`, carrying the original path and query string as a `returnUrl` query param. `/change-password` SHALL be reachable only with a valid token — it is not a public path — so an anonymous request for it is still sent to `/login`.

#### Scenario: Anonymous user requests a dashboard page
- **WHEN** a request has no `access_token` cookie and targets a non-public path
- **THEN** the response redirects to `/login?returnUrl=<original-path>`

#### Scenario: Anonymous user requests a dashboard page with query parameters
- **WHEN** a request has no `access_token` cookie and targets `/schedules/123?date=2026-08-24`
- **THEN** the response redirects to `/login?returnUrl=%2Fschedules%2F123%3Fdate%3D2026-08-24`, preserving the query string

#### Scenario: Authenticated user requests the login page
- **WHEN** a request has an `access_token` cookie and targets `/login`
- **THEN** the response redirects to `/`

#### Scenario: Flagged user requests a dashboard page
- **WHEN** a request carries a valid `access_token` cookie whose `mustChangePassword` claim is true and targets `/employees`
- **THEN** the response redirects to `/change-password?returnUrl=%2Femployees`

#### Scenario: Flagged user requests the change-password page
- **WHEN** a request carries a valid `access_token` cookie whose `mustChangePassword` claim is true and targets `/change-password`
- **THEN** the request is allowed through without redirect

#### Scenario: Anonymous user requests the change-password page
- **WHEN** a request has no `access_token` cookie and targets `/change-password`
- **THEN** the response redirects to `/login?returnUrl=%2Fchange-password`
