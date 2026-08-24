## Context

Backend already exposes the full domain (`openapi/openapi.json`): `/master-shift-templates`, `/sub-shift-templates` (`type`: `MAIN`/`SUPPORT`), `/master-shifts/generate` (`{masterShiftTemplateId, workDate}` -> creates a `MasterShift` + its `SubShift`s + `Task`s), `/master-shifts`, `/sub-shifts`, `/assignments`. The frontend has not caught up:

- `/shifts` (admin nav, "Loai ca lam viec") edits only the flat `MasterShiftTemplate` (name/abbreviation/time/status/note) via a small dialog (`MasterShiftTemplateDetail`). There is no `subShiftTemplate` feature module at all - `/sub-shift-templates` is unused by the frontend.
- `sub-shift` (generated instance) frontend logic hard-codes `masterShift.subShifts?.[0]` as "the" sub-shift for a cell (`calendar-slot-cell.tsx`), matching the documented backend limitation that only one default `MAIN` sub-shift is ever created.
- `/rosters` (manager nav, "Lich lam viec") is a real-data, read-only weekly grid (rows = templates, columns = days) with summary cards. It has no week navigation (`generateWeekdays(new Date())` is hard-coded to "this week") and no way to generate a shift for an empty cell - `useGenerateMasterShift` exists in `masterShift` hooks but is never called from any UI.
- `/schedules` (manager nav, "Xep ca") is an older assignment-editing page still built on mock data (`sampleShifts`) and pre-refactor types (`WeeklySchedule`, `ScheduleSlot`). It duplicates what "Weekly Schedule" should mean, on a stale data model.

Two manager-facing pages currently claim the same conceptual space (view + assign the week's shifts). This is the core IA problem this change resolves, on top of adding the missing Shift Template composition UI.

## Goals / Non-Goals

**Goals:**
- One unambiguous place to define shift *structure* (Shift Templates) and one to work with the *generated week* (Weekly Schedule).
- Let admins compose a `MasterShiftTemplate` from multiple `SubShiftTemplate`s (MAIN/SUPPORT) with the MAIN-non-overlap rule enforced in the UI.
- Let managers generate a week's shifts from templates and assign employees, from a single page.
- MVP-simple: forms, lists, cards, a plain grid - no drag-and-drop, no calendar library.

**Non-Goals:**
- Full task-template management UI (recurring checklists, due dates, per-role assignment rules). Tasks are represented as a minimal inline list on the template for this pass only.
- Changing backend contracts - every endpoint this design uses already exists.
- Mobile/staff-facing UI (out of scope per the prompt; that's a separate concern).
- Rebuilding the roster grid as an actual calendar widget (drag to resize, etc.) - it stays a template-row x day-column table.

## Decisions

### 1. `/shifts` stays the Shift Templates home, gains nested composition
Keep the existing route and list; do not introduce a second "shift structure" page. The create/edit surface changes from a small modal to a **wide Sheet (side drawer)** so it can host three stacked sections (master fields, sub-shift-templates, tasks) without a second navigation hop. A full dedicated page (`/shifts/[id]`) was considered but rejected for MVP: a drawer keeps the list visible/reachable and avoids adding a new route layer for what is still fundamentally "edit one record and its children."

### 2. Retire `/schedules`, promote `/rosters` to the single Weekly Schedule page
`/rosters` already talks to the real, current data model (`masterShift`, `subShift`, `assignment`); `/schedules` does not. Rather than migrate `/schedules` onto the new model, extend `/rosters` with the two things it's missing - week navigation and an assign action - and remove `/schedules` from `MANAGER_ROUTES`. The `employeeAssignment/` dialog components under `/schedules` are reused (moved/adapted) rather than rewritten, since they already implement an employee-picker assignment dialog.
Alternative considered: keep both, retitle `/schedules` to "Assign" and `/rosters` to "View." Rejected - it re-creates the exact ambiguity ("which page do I use to schedule someone?") this change exists to remove, and doubles the surface to maintain against one data model.

### 3. Cell-level actions instead of a wizard
Each Weekly Schedule grid cell is either empty (no `MasterShift` generated yet for that template/day) or populated. Empty cells get a small inline "Generate" affordance; populated cells list every generated sub-shift with an "Assign" affordance per sub-shift. No bulk multi-week wizard in this pass - a per-branch "Generate this week" button covers the common case (loop `generate` over every template x day still empty), and per-cell generate covers the exception.

### 4. Overlap validation lives client-side, at save time
The backend has no overlap constraint on `/sub-shift-templates` today. Validation ("no two MAIN sub-shift-templates for the same master template may overlap") is enforced in the edit-drawer form before submit, checked against the current in-memory list of sibling sub-shift-templates. This is consistent with how `startTime`/`endTime` are already treated as trusted wall-clock strings client-side (see `master-shift-template` spec's timezone-free requirement).

### 5. "Milestones" and "tasks" map onto the existing Task/TaskTemplate model, kept minimal
The prompt's "operational milestones such as opening/closing" and "tasks associated with the operation" already correspond to the backend's `Task`/`TaskTemplate` entities (`type`: `SHARED_MANDATORY`/`SHARED_OPTIONAL`/`DEDICATED`, generated alongside the shift by `/master-shifts/generate`). No new entity is introduced. The template drawer gets a simple flat list (title + type badge, add/remove) - no due dates, no per-sub-shift task assignment UI yet; that's flagged as a Non-Goal / future follow-up.

## Risks / Trade-offs

- **[Risk]** Removing `/schedules` deletes a manager-facing entry point some users may already rely on for assignment -> **Mitigation**: the same assign interaction (employee picker dialog) is preserved, just relocated into `/rosters`; communicate the nav change (route redirect from `/schedules` to `/rosters` for one release rather than a hard 404).
- **[Risk]** Rendering all sub-shifts per cell (instead of `subShifts[0]`) increases cell height/density once a template has 3 (MAIN+MAIN+SUPPORT) sub-shift-templates -> **Mitigation**: cap visible rows per cell with a "+N more" affordance if needed; acceptable to defer until real data shows it's a problem (MVP).
- **[Risk]** Client-only overlap validation can be bypassed by concurrent edits or future non-UI clients -> **Mitigation**: acceptable for MVP; note as a follow-up to add a backend constraint.
- **[Trade-off]** A Sheet/drawer for template editing is simpler to ship than a dedicated page, but will feel cramped if task/sub-shift lists grow large - acceptable given MVP's "fast implementation" priority; revisit if template complexity grows.

## Open Questions

- Should "Generate this week" be per-branch-per-week only, or also support generating a specific future week ahead of time? Assumed: the week navigator already lets managers move to a future week and generate there, so no separate "generate ahead" flow is needed.
- Exact Vietnamese copy for the relabeled `/rosters` page and the new Generate/Assign actions - left to implementation, following the existing `routes.ts` label style (e.g. "Lich lam viec").
