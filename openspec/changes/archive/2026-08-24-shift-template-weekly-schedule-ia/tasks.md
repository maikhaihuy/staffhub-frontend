## 1. `subShiftTemplate` feature module (new)

- [x] 1.1 Add `API_ENDPOINTS.SUB_SHIFT_TEMPLATES` (`/sub-shift-templates`) to `src/lib/api/endpoints.ts`
- [x] 1.2 Create `src/features/subShiftTemplate/types/index.ts` (`SubShiftTemplate`, `type: 'MAIN' | 'SUPPORT'`, mirroring `CreateSubShiftTemplateDto`/`UpdateSubShiftTemplateDto`)
- [x] 1.3 Create `src/features/subShiftTemplate/services/subShiftTemplate.service.ts` (create/update/delete/listByMasterShiftTemplate) calling the shared axios instance
- [x] 1.4 Create `src/features/subShiftTemplate/schemas.ts` (Zod schema for the create/edit form)
- [x] 1.5 Create `src/features/subShiftTemplate/hooks/useSubShiftTemplateQueries.ts` and `useSubShiftTemplateMutations.ts` (+ `hooks/index.ts` re-export), using `useAppQuery`/`useAppMutation`
- [x] 1.6 Implement client-side MAIN-overlap validation helper (pure function: given a candidate MAIN slot and sibling sub-shift-templates, return conflict or null) with unit-testable logic

## 2. Shift Templates page: nested composition

- [x] 2.1 Add a composition-summary cell (e.g. "2 MAIN Â· 1 SUPPORT") to the `/shifts` list table, sourced from each template's sub-shift-templates count
- [x] 2.2 Replace `MasterShiftTemplateDetail`'s modal with a wide Sheet/drawer that keeps the existing master-field form and adds a sub-shift-templates section below it
- [x] 2.3 Build the sub-shift-template list/table inside the drawer (name, type badge, time range, max assignments, status, edit/remove actions)
- [x] 2.4 Build the add/edit sub-shift-template inline form (name, type select, start/end time, maxAssignments, note), wired to the 1.6 overlap check with an inline error state
- [x] 2.5 Add the minimal task list section to the drawer (title, type badge, add/remove) using `/task-templates` scoped to `masterShiftTemplateId`
- [x] 2.6 Add "View in Weekly Schedule" row action linking to `/rosters?branchId=<id>`

## 3. `masterShift` generation wiring

- [x] 3.1 Add a generation-eligibility helper (template has >=1 sub-shift-template) reused by both the Shift Templates list and the Weekly Schedule Generate action
- [x] 3.2 Confirm `useGenerateMasterShift` invalidates the same query key the Weekly Schedule grid reads, so a generated cell appears without a manual refetch

## 4. Weekly Schedule page (`/rosters`)

- [x] 4.1 Add week navigation (prev/next/this-week) replacing the hard-coded `generateWeekdays(new Date())`, re-deriving `from`/`to` for the master-shift query
- [x] 4.2 Update `CalendarSlotCell` to render every entry in `masterShift.subShifts`, not just `subShifts[0]`
- [x] 4.3 Add an empty-cell "Generate" affordance calling `useGenerateMasterShift`, disabled per the 3.1 eligibility helper
- [x] 4.4 Add a branch-level "Generate this week" action that calls generate for every still-empty template/day combination in the displayed week
- [x] 4.5 Add an "Assign" action per sub-shift row; built against the current `assignment` feature (the old `/schedules/employeeAssignment/` dialog turned out to be built on the legacy `roster`/`schedule` mock-data types, not the real `assignment` feature, so it was not reusable as-is - a new dialog was written against `useCreateAssignment` instead)
- [x] 4.6 Add a "Manage Shift Templates" header link to `/shifts?branchId=<id>`
- [x] 4.7 Verify summary cards (Total Shifts/Assignments/Capacity/Active Employees) still compute correctly once cells can render multiple sub-shifts

## 5. Navigation cleanup

- [x] 5.1 Remove the `/schedules` ("Xep ca") entry from `MANAGER_ROUTES` in `src/constants/routes.ts`
- [x] 5.2 Add a redirect from `/schedules` to `/rosters` (temporary, one release) instead of leaving a dead route
- [x] 5.3 Update `/rosters`' nav label/breadcrumb if needed to read as "Weekly Schedule" ("Lich lam viec") - existing label "Lịch làm việc" already fits; no change needed

## 6. Verification

- [x] 6.1 Manually walk: create a template with two MAIN + one SUPPORT sub-shift-template, confirm overlapping MAIN slots are rejected and the SUPPORT overlap is allowed. Verified live in a browser (Playwright-driven) against the real backend at localhost:3094 - overlap correctly rejected with inline error, non-overlapping MAIN and overlapping SUPPORT both saved. Found and fixed two real bugs in the process: (1) the create-then-edit drawer never switched into edit mode after creating a new template, so there was no way to add sub-shift templates without closing/reopening - added an `onCreated` callback that switches the drawer in place; (2) the sub-shift-template create/update payload sent raw "HH:mm" strings instead of ISO datetimes, causing a backend 500 - fixed to match the master-shift-template convention (`getTimeFromString(...).toISOString()`)
- [x] 6.2 Manually walk: generate a week from a template on `/rosters`, confirm all generated sub-shifts render and can each receive an assignment. Verified live - Generate created the shift, the cell rendered all 3 sub-shifts (not just one), and an employee was successfully assigned via the dialog, with summary cards updating live. Found and fixed a real crash: the employee-availability filter used `employee.branchIds`, but the real `GET /employees` response has no `branchIds` field at all (only a `branches: [{id,...}]` relation) - this threw `Cannot read properties of undefined` and also silently emptied the employee picker; fixed to check `employee.branches` first
- [x] 6.3 Confirm `/schedules` redirects and no nav item points to it
- [x] 6.4 Run `pnpm lint` and `tsc --noEmit` - both clean for all touched/new files (pre-existing baseline errors elsewhere in the repo are unrelated and untouched). Deleted the now-dead, already-broken `/schedules` subcomponents and the `BranchWithShifts`/`sampleShifts` mock chain they alone depended on (orphaned once `/schedules` no longer renders them; `branchWithShiftsSchema` was already marked `@deprecated ... pending removal once the rosters/schedules pages are rewired onto real masterShiftTemplate data`)
