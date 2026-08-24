## Context

See proposal.md - Why. Current implementation: `src/features/masterShiftTemplate/components/detail.tsx` wraps the shared `src/components/shared/drawer-form.tsx` (`DrawerForm`, shadcn Drawer) and renders `MasterShiftTemplateForm` + `SubShiftTemplateSection` + `TaskTemplateSection` in one scrolling panel, opened from `src/app/(dashboard)/shifts/page.tsx` via button clicks that toggle `selectedTemplateId` + `open` state (no route change). `DrawerForm` is shared with `branch`, `employee`, and `users` — it stays as-is for those; only the master-shift-template usage is replaced.

Sub-shift template add/edit is already Dialog-based (`sub-shift-template-section.tsx`), reusing a standalone `SubShiftTemplateForm`. Task templates currently use a flat, master-scoped list (`task-template-section.tsx`) even though the `TaskTemplate` DTO already carries an optional `subShiftTemplateId` (backend-supported, unused by the MVP UI per its own code comment) — no schema or endpoint change is needed to scope tasks per sub-shift.

## Goals / Non-Goals

**Goals:**
- Replace the Drawer container with a routed detail page while reusing every existing form component, schema, hook, and service as-is.
- Keep the page to exactly two content sections (Overview, Sub Shifts) plus a header action row, per the requested IA.
- Scope task management per sub-shift template using the already-present `subShiftTemplateId` field, with zero backend/schema changes.

**Non-Goals:**
- No changes to validation rules (MAIN-overlap, bounding checks), REST contracts, or the `master-shift`/`sub-shift` (dated instance) features consumed in `/rosters` and `/my-availabilities`.
- No new workflow states, notifications, approvals, or permissions — Archive continues to mean the existing `status: 'ARCHIVED'` transition.
- No redesign of `DrawerForm` itself or its other consumers (branch, employee, users).

## Decisions

**Route shape**: `src/app/(dashboard)/shifts/[id]/page.tsx`, a client component reading `id` from params and `branchId` still carried as a query param (matches existing list page's branch-scoping pattern) or resolved from the fetched template's own `branchId` — resolve via `useMasterShiftTemplateQueries` fetch-by-id (extend the existing query hook if it only supports list-by-branch today; no schema change, just an additional query key). Alternative considered: keep `id` in a query param (`/shifts?id=`) to avoid touching routing — rejected because a path segment better matches "stable URL, bookmarkable, browser-navigable" from the proposal and is the idiomatic Next.js App Router shape for a resource detail page.

**Master edit surface**: a Dialog reusing `MasterShiftTemplateForm` unchanged, opened by the page's "Edit" action and (for new/duplicate) by the list's "Add"/"Duplicate" actions. On successful create, the mutation's `onSuccess` navigates (`router.push`) to the new template's detail page instead of just closing the drawer. Alternative considered: a full "new template" page mirroring the detail page — rejected as unnecessary weight for a 5-field form (MVP simplicity rule).

**Sub Shifts section**: cards (Card + Badge for status/type + DropdownMenu for row actions), replacing `SubShiftTemplateSection`'s current table/list rendering inside the drawer; the section keeps its existing Dialog-based add/edit (`SubShiftTemplateForm`) and existing overlap/bounds validation untouched — only the container changes.

**Task scoping migration**: `task-template-section.tsx`'s flat, master-scoped list is retired from the detail page. Its add/edit logic (title/type form, `useTaskTemplateMutations`) moves inside the Sub Shift edit Dialog, now passing `subShiftTemplateId` on create so tasks attach to the specific sub-shift being edited. Existing task templates already persisted with `subShiftTemplateId: undefined` (created under the old flat-list flow) become orphaned from any sub-shift's checklist — see Risks.

**Duplicate flow**: unchanged business logic (`handleDuplicate` prefetch + replay); UI-wise it now opens the same master-edit Dialog pre-filled (instead of the Drawer in create mode) and, once the new template and its replayed sub-shift templates are created, navigates to the new template's detail page.

## Risks / Trade-offs

[Existing task templates created before this change have no `subShiftTemplateId`] → They won't appear under any sub-shift's checklist once tasks move to per-sub-shift scoping. Mitigation: this is a data/UI visibility gap, not data loss — the rows still exist via `/task-templates`; flag to the user as a one-time manual step (reassign or recreate under a sub-shift) rather than building a migration script, since no test runner or migration tooling exists in this repo per CLAUDE.md.

[Removing the Drawer changes the list's row action from "open panel in place" to "navigate away"] → Slightly slower to skim many templates in sequence. Mitigation: keep the list page itself unchanged (still a fast overview table); only the edit destination changes, and back/forward makes returning to the list a single action.

[`useMasterShiftTemplateQueries` may only support list-by-branch today, not fetch-by-id] → Requires adding a get-by-id query. Mitigation: `createCrudService` (used by all three services) already wraps standard REST CRUD, so a `GET /master-shift-templates/:id` call is a thin addition, not new backend work.

## Migration Plan

1. Build the detail page and its Overview/Sub Shifts sections against existing hooks/services, alongside the existing Drawer (no route removed yet).
2. Point the list's edit/duplicate/row actions at the new route; remove the Drawer usage from `shifts/page.tsx` and delete `masterShiftTemplate/components/detail.tsx` once the page is verified.
3. Move `task-template-section.tsx`'s add/edit logic into the Sub Shift edit Dialog; retire the flat section from the detail page.
4. No backend migration required (schema unchanged); no rollback beyond reverting the frontend commits, since no data is destructively altered.
