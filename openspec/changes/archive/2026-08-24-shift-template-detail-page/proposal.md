## Why

Master Shift Templates now compose sub-shift templates and task templates, and more configuration (Role & Permission scoping) is coming. The current Drawer (`MasterShiftTemplateDetail`, wrapping the shared `DrawerForm`) squeezes master fields, a sub-shift list, and a task list into one narrow, single-scroll side panel — it's already cramped and won't scale. Moving to a dedicated detail page with a stable URL gives the domain room to grow, supports normal browser navigation (back/forward, deep links, bookmarks), and keeps the Drawer pattern reserved for genuinely simple, single-form entities.

## What Changes

- Replace the `MasterShiftTemplateDetail` Drawer with a dedicated detail page at `/shifts/:id` (or equivalent dynamic route under the existing `(dashboard)/shifts` route group), reached from the Shift Templates list.
- **BREAKING**: The list's row/edit action navigates to the detail page instead of opening a Drawer. Existing Drawer-based edit entry points for master shift templates are removed.
- Detail page shows: a back link to the list, the master shift's name/hours as the page title, primary actions (Edit, Duplicate, Archive) top-right, a compact read-only Overview section (name, start/end time, status), and a Sub Shifts section listing all sub-shift templates as cards (name, time range, task count, status, overflow menu).
- Master shift template editing moves into a Dialog (fields: name, abbreviation, start/end time, status, note) launched from the page's "Edit" action — no second full page.
- Sub-shift template Add/Edit stays Dialog-based (already the pattern via `SubShiftTemplateForm`), now launched from the Sub Shifts section of the detail page instead of from inside the Drawer.
- Task templates move from an always-visible section in the Drawer to being managed per sub-shift, reachable from the Sub Shift edit Dialog (task checklist), rather than a flat list on the page — reducing the top-level page to two sections (Overview, Sub Shifts) per the requested IA.
- Empty state for the Sub Shifts section when a template has zero sub-shift templates.
- Duplicate and Archive actions keep their existing business logic (duplication replay, status change) but are invoked from the detail page's action row / overflow menu instead of the list row.
- No changes to data model, validation rules (MAIN-overlap, bounding checks), or REST endpoints.

## Capabilities

### New Capabilities
(none — this is an information-architecture and interaction-pattern change to existing capabilities, not a new business capability)

### Modified Capabilities
- `master-shift-template`: the "Template edit surface composes nested sub-shift templates" and "Template edit surface manages a minimal task list" requirements change from a Drawer-hosted edit surface to a dedicated detail page (stable route) with editing via Dialog; task management moves from a flat page-level list to per-sub-shift management.
- `sub-shift-template`: the "Adding a sub-shift template from the template edit drawer" scenario changes from "drawer" to the detail page's Sub Shifts section (Dialog-based add/edit continues unchanged).

## Impact

- **Removed/rewritten**: `src/features/masterShiftTemplate/components/detail.tsx` (Drawer), its use of the shared `src/components/shared/drawer-form.tsx`.
- **New**: a detail page route under `src/app/(dashboard)/shifts/[id]/page.tsx` (or similar) composing Overview, Sub Shifts list, and the Master Shift edit Dialog.
- **Modified**: `src/features/masterShiftTemplate/components/list.tsx` and `src/app/(dashboard)/shifts/page.tsx` — edit/duplicate actions navigate to the detail route instead of toggling Drawer state.
- **Reused as-is**: `SubShiftTemplateForm`, `MasterShiftTemplateForm` (now hosted in a Dialog instead of the Drawer), existing Zod schemas, hooks (`useMasterShiftTemplateQueries/Mutations`, `useSubShiftTemplateComposition`), and services (no API contract changes).
- **Relocated**: task-template management moves from `task-template-section.tsx` (flat, page-level) into the Sub Shift edit Dialog's task checklist, scoped per sub-shift.
- Out of scope: `master-shift`/`sub-shift` (dated instances) consumed read-only in `/rosters` and `/my-availabilities` are unaffected.
