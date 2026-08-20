## MODIFIED Requirements

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

### Requirement: Current user is derived from the access token
The system SHALL NOT call a `/auth/me` endpoint (none exists on the backend). It SHALL instead decode the JWT `accessToken` payload (`sub`, `phone`, optional `role`/`branches`/`empId`) into the current-user object on every login, refresh, and app load. `AuthContext` SHALL also clear this derived user (along with `accessToken`/`refreshToken` state) and redirect to `/login` in response to an `auth:session-expired` event, so a forced logout from a failed token refresh is reflected in React state rather than only in cookies.

#### Scenario: User has no linked employee record
- **WHEN** the decoded token omits `role`, `branches`, and `empId`
- **THEN** the system treats the user as authenticated with only `id`/`phone` known, without erroring

#### Scenario: Session expires while the app is mounted
- **WHEN** `AuthContext` receives an `auth:session-expired` event (dispatched after an unrecoverable 401)
- **THEN** it clears its `user`, `accessToken`, and `refreshToken` state and navigates to `/login` via the router, without requiring a full page reload
