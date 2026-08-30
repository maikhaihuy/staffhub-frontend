## MODIFIED Requirements

### Requirement: Unauthenticated or expired access to protected routes is blocked server-side
`middleware.ts` SHALL redirect a request to a non-public path to `/login`, carrying the original
path and query string as a `returnUrl` query param, only when there is no recoverable session:
either there is no `access_token` cookie at all, or the `access_token` is expired **and** the
`refresh_token` cookie is also missing or expired.

When the `access_token` is expired but the `refresh_token` cookie is present and unexpired, the
system SHALL treat the session as recoverable and allow the request through without redirecting to
`/login` — the client-side axios interceptor performs the actual silent refresh via `POST
/auth/refresh` on that page's first API call, the same way it already does for a `401` mid-session
(see "Expired access tokens are refreshed transparently" above).

A request considered authenticated or refreshable (a valid `access_token`, or an expired
`access_token` with a valid `refresh_token`) hitting a public path (e.g. `/login`) SHALL be
redirected to `/`.

See the `page-level-authorization` capability for the full expiry/malformed-token validation rules
this check applies.

#### Scenario: Anonymous user requests a dashboard page
- **WHEN** a request has no `access_token` cookie and targets a non-public path
- **THEN** the response redirects to `/login?returnUrl=<original-path>`

#### Scenario: Anonymous user requests a dashboard page with query parameters
- **WHEN** a request has no `access_token` cookie and targets `/schedules/123?date=2026-08-24`
- **THEN** the response redirects to `/login?returnUrl=%2Fschedules%2F123%3Fdate%3D2026-08-24`, preserving the query string

#### Scenario: Authenticated user requests the login page
- **WHEN** a request has a valid, unexpired `access_token` cookie and targets `/login`
- **THEN** the response redirects to `/`

#### Scenario: Access token expired but refresh token still valid, dashboard page
- **WHEN** a request targets a non-public path, its `access_token` cookie is present but expired, and its `refresh_token` cookie is present and unexpired
- **THEN** the response is not redirected to `/login`; the request proceeds to the requested page, leaving the actual token refresh to the client-side axios interceptor on that page's first API call

#### Scenario: Access token expired but refresh token still valid, login page
- **WHEN** a request targets `/login`, its `access_token` cookie is present but expired, and its `refresh_token` cookie is present and unexpired
- **THEN** the response redirects to `/`

#### Scenario: Both access token and refresh token expired
- **WHEN** a request targets a non-public path and both the `access_token` and `refresh_token` cookies are present but expired
- **THEN** the response redirects to `/login?returnUrl=<original-path>`

#### Scenario: Access token expired with no refresh token cookie at all
- **WHEN** a request targets a non-public path, its `access_token` cookie is present but expired, and no `refresh_token` cookie is present
- **THEN** the response redirects to `/login?returnUrl=<original-path>`
