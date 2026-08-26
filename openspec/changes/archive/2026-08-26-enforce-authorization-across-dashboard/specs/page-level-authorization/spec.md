## ADDED Requirements

### Requirement: Dashboard pages gate rendering on CASL ability
Every `(dashboard)` page with an established `action`/`subject` permission SHALL check the
current user's CASL ability for that pair before rendering its real content, instead of
rendering unconditionally for any authenticated session. This applies to every page listed under
`ADMIN_ROUTES` or `MANAGER_ROUTES` in `src/constants/routes.ts` (including their dynamic detail
routes), plus `branches` and `permission-simulator`.

General self-service pages listed under `GENERAL_ROUTES` (which by convention carry no
`requiredPermission`, per that file's own doc comment) are explicitly out of scope: they have no
established permission subject to check, and inventing one risks locking out users who currently
have legitimate access. This includes `attendanceTracking` and `my-calendars` (unbuilt scaffold
placeholders whose permission model is deferred to a separate, not-yet-started change) and
`my-availabilities/[id]` (a real page with no self-service-scoped permission convention yet - the
only related subject, `availability`, is the *manager's* review-all-submissions grant, not a
staff member's own).

#### Scenario: User lacks the required ability
- **WHEN** an authenticated user whose resolved abilities do not grant the page's required
  `action`/`subject` navigates to that page (directly, via bookmark, or via a link)
- **THEN** the page renders a "no access" state in place of its real content, and no
  page-specific data fetches or mutations for that page's content are triggered

#### Scenario: User has the required ability
- **WHEN** an authenticated user whose resolved abilities grant the page's required
  `action`/`subject` navigates to that page
- **THEN** the page renders its real content as before

#### Scenario: Ability is still loading
- **WHEN** a user navigates to a gated page and `useAbility()` has not yet resolved
- **THEN** the page renders a loading state and neither the "no access" state nor the real
  content is shown until the ability check completes

### Requirement: Expired or malformed session tokens are rejected at the edge
`src/middleware.ts` SHALL validate the `access_token` cookie's expiry (`exp` claim) in addition
to checking its presence, for every non-public route, before allowing the request through to a
dashboard page.

#### Scenario: Token is missing
- **WHEN** a request for a non-public path carries no `access_token` cookie
- **THEN** the request is redirected to `/login` with a `returnUrl` pointing back at the
  originally requested path

#### Scenario: Token is present but expired or malformed
- **WHEN** a request for a non-public path carries an `access_token` cookie whose payload cannot
  be decoded, or whose `exp` claim is in the past
- **THEN** the `access_token` cookie is cleared and the request is redirected to `/login` with a
  `returnUrl` pointing back at the originally requested path

#### Scenario: Token is present and valid
- **WHEN** a request for a non-public path carries an `access_token` cookie whose payload decodes
  and whose `exp` claim is in the future
- **THEN** the request proceeds to the requested page

### Requirement: Middleware does not perform role/ability-level route gating
`src/middleware.ts` SHALL limit its checks to authentication validity (token presence and
expiry) and SHALL NOT deny or redirect a request based on the user's role or CASL abilities.
Role/ability-level gating is performed exclusively client-side via CASL, per the "Dashboard
pages gate rendering on CASL ability" requirement above.

#### Scenario: Authenticated user without a required ability reaches the page shell
- **WHEN** a request carries a valid, unexpired `access_token` cookie for a dashboard route the
  user's abilities do not grant
- **THEN** middleware allows the request through to the page (it is not redirected or blocked at
  the middleware layer), and the page itself is responsible for rendering the "no access" state
