## Why

The domain already distinguishes a **Shift Template** (the structural blueprint: `MasterShiftTemplate` + `SubShiftTemplate`) from a **Weekly Schedule** (the generated, dated instances that employees get assigned into), and the backend fully supports both (`/master-shift-templates`, `/sub-shift-templates`, `/master-shifts/generate`, `/assignments`). The frontend does not yet reflect this: `/shifts` only manages the flat master template (no nested sub-shift-templates, no MAIN/SUPPORT concept, no tasks), the frontend hard-codes "one sub-shift per master shift," there is no UI to trigger generation from a template, and there are two competing manager pages (`/rosters` read-only calendar, `/schedules` a stale mock-data assignment page) covering what should be a single "Weekly Schedule" screen. This proposal defines the information architecture and navigation to close that gap for the admin/manager web app, MVP-scoped (no drag-and-drop, no complex calendar widget).

## What Changes

- Extend the Shift Templates page (`/shifts`) so a template's create/edit flow manages its nested `SubShiftTemplate`s (MAIN/SUPPORT, with MAIN-vs-MAIN overlap validation) and an optional simple task list, instead of only flat master-level fields.
- Add a composition summary (e.g. "2 MAIN Â· 1 SUPPORT") to the Shift Templates list so admins see structure at a glance.
- Turn `/rosters` ("Lich lam viec") into the single **Weekly Schedule** page: add week navigation, a "Generate" action on empty template/day cells (calls `POST /master-shifts/generate`), and an "Assign employee" action on each generated sub-shift row (reuses the existing `assignment` CRUD).
- Render **all** of a master shift's generated sub-shifts in a calendar cell, not just `subShifts[0]`.
- **BREAKING (UX)**: retire the `/schedules` ("Xep ca") manager page - its mock-data assignment flow is superseded by the interactive `/rosters` Weekly Schedule page; remove it from `MANAGER_ROUTES`.
- Add lightweight cross-navigation: a "View in Weekly Schedule" link from a template row, and a "Manage Shift Templates" link from the Weekly Schedule header.

## Capabilities

### New Capabilities
- `sub-shift-template`: CRUD and nested-management UI for MAIN/SUPPORT staffing slots inside a master shift template, including the MAIN-vs-MAIN non-overlap rule (backend endpoints already exist at `/sub-shift-templates`; no frontend feature currently consumes them).

### Modified Capabilities
- `master-shift-template`: template detail/edit now composes and persists child sub-shift-templates (and an optional minimal task list); the list view surfaces a composition summary; a template needs at least one sub-shift-template before it can be generated.
- `sub-shift`: removes the "exactly one default MAIN sub-shift, `subShifts[0]` is authoritative" limitation now that templates can define multiple sub-shift-templates - all generated sub-shifts for a master shift must be rendered.
- `roster-calendar`: evolves from a read-only aggregate view into the single interactive Weekly Schedule surface - adds week navigation, a per-cell Generate action, and a per-sub-shift Assign action; its purpose statement and "read-only" framing are superseded.

## Impact

- Frontend routes: `/shifts` (extended), `/rosters` (extended, becomes "Weekly Schedule"), `/schedules` (removed from nav; its `employeeAssignment/` assign-dialog components are reused, not reinvented, inside the new `/rosters` assign flow).
- `src/constants/routes.ts`: drop the `/schedules` entry from `MANAGER_ROUTES`; relabel `/rosters` if needed.
- Features touched: `masterShiftTemplate` (new nested sub-shift-template + task sub-forms), a new `subShiftTemplate` feature module (services/hooks/schemas/types, mirroring the `subShift` feature), `masterShift` (surface the existing but currently unused `useGenerateMasterShift` mutation in the UI), `assignment` (consumed, not changed).
- No backend changes required - `/sub-shift-templates`, `/master-shifts/generate`, and `/assignments` already exist per `openapi/openapi.json`.
