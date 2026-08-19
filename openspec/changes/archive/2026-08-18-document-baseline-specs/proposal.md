## Why

OpenSpec was just added to this repo, but `openspec/specs/` is empty. The codebase already has real, backend-verified behavior for auth and several core entities (branches, employees, users, and the master-shift/assignment scheduling domain that replaced the old mocked shift/schedule/roster model). Without a spec baseline, future changes have nothing to diff against and no record of the contracts already implemented and verified live against the real backend this session. This change captures that existing behavior as baseline specs.

## What Changes

- No application behavior changes. This is a documentation-only change: it writes `specs/<capability>/spec.md` delta files describing capabilities that already exist and are already implemented and verified.
- Capabilities still backed by mocked/legacy data (`my-availabilities`, `schedules`) are intentionally **excluded** — they're mid-migration (see repo TODOs) and documenting their current mocked behavior as a "spec" would misrepresent it as an intended contract. They'll get specs once their migration (Phase 3/4) lands.

## Capabilities

### New Capabilities
- `auth`: Cookie-based JWT login/refresh/logout flow, JWT-decoded current-user derivation (no `/auth/me`), axios interceptor auto-refresh-and-retry on 401.
- `branch-management`: CRUD for branches.
- `employee-management`: CRUD for employees.
- `user-management`: CRUD for platform users and their role assignment.
- `master-shift-template`: CRUD for recurring, per-branch shift templates (name, time-of-day window, status).
- `master-shift`: Dated shift instances generated from a template (or created standalone) for a branch, carrying one or more sub-shifts.
- `sub-shift`: Role/slot pool within a master shift with a capacity (`maxAssignments`).
- `assignment`: Employee-to-sub-shift assignment lifecycle, including check-in/check-out actual-time tracking.
- `roster-calendar`: Read-only weekly per-branch calendar view aggregating master shifts, sub-shifts, and assignments with summary stats.

### Modified Capabilities
(none — no existing main specs yet)

## Impact

Affected: `openspec/specs/` only (new spec files). No source code, tests, or config change. Source of truth for each spec is the already-merged code under `src/features/{auth,branch,employee,users,masterShiftTemplate,masterShift,subShift,assignment}/` and `src/app/(dashboard)/rosters/`.
