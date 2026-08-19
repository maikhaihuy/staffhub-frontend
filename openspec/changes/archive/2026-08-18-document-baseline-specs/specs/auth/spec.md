## Purpose

Authenticates users against the real backend via a phone/password login, persists JWTs in cookies so both client and server (middleware) can read them, and transparently refreshes expired access tokens.

## ADDED Requirements

### Requirement: Login issues and persists tokens
The system SHALL authenticate a user via `POST /auth/login` with `username`/`password`, and on success SHALL persist the returned `accessToken`/`refreshToken` in cookies (not localStorage), so `middleware.ts` can read them server-side.

#### Scenario: Successful login
- **WHEN** a user submits valid phone/password credentials
- **THEN** the system stores `access_token`/`refresh_token` cookies and redirects to the `returnUrl` query param, or `/` if absent

#### Scenario: Invalid credentials
- **WHEN** login fails
- **THEN** the system shows a toast with the backend's error message and does not persist any tokens

### Requirement: Current user is derived from the access token
The system SHALL NOT call a `/auth/me` endpoint (none exists on the backend). It SHALL instead decode the JWT `accessToken` payload (`sub`, `phone`, optional `role`/`branches`/`empId`) into the current-user object on every login, refresh, and app load.

#### Scenario: User has no linked employee record
- **WHEN** the decoded token omits `role`, `branches`, and `empId`
- **THEN** the system treats the user as authenticated with only `id`/`phone` known, without erroring

### Requirement: Expired access tokens are refreshed transparently
The system SHALL intercept any `401` response, attempt exactly one `POST /auth/refresh` using the stored refresh token, and retry the original request with the new access token. Concurrent requests that 401 while a refresh is already in flight SHALL be queued and retried once the refresh completes, rather than each triggering their own refresh call.

#### Scenario: Single request hits 401
- **WHEN** any authenticated request returns 401 and no refresh is already in progress
- **THEN** the system refreshes the token once and retries the original request with the new token

#### Scenario: Multiple requests hit 401 simultaneously
- **WHEN** several requests 401 while a refresh is already in flight
- **THEN** only one refresh call is made; all queued requests retry with the token it returns

#### Scenario: Refresh itself fails
- **WHEN** `POST /auth/refresh` fails (e.g. refresh token expired/invalid)
- **THEN** the system clears all tokens and redirects to `/login`

### Requirement: Refresh request body includes both key casings
The backend's refresh-token strategy reads `refresh_token` (snake_case) from the request body while its validated DTO expects `refreshToken` (camelCase). The system SHALL send both keys with the same value on every refresh/logout call until the backend is reconciled to accept one.

#### Scenario: Refresh call
- **WHEN** the system calls `POST /auth/refresh` or `POST /auth/logout`
- **THEN** the request body includes both `refreshToken` and `refresh_token` set to the same value

### Requirement: Unauthenticated access to protected routes is blocked server-side
`middleware.ts` SHALL redirect any request to a non-public path that lacks an `access_token` cookie to `/login`, carrying the original path as a `returnUrl` query param. An authenticated user (has `access_token`) hitting a public path (e.g. `/login`) SHALL be redirected to `/`.

#### Scenario: Anonymous user requests a dashboard page
- **WHEN** a request has no `access_token` cookie and targets a non-public path
- **THEN** the response redirects to `/login?returnUrl=<original-path>`

#### Scenario: Authenticated user requests the login page
- **WHEN** a request has an `access_token` cookie and targets `/login`
- **THEN** the response redirects to `/`
