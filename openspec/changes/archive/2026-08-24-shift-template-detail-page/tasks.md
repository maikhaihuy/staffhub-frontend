## 1. Data layer: fetch-by-id support

- [x] 1.1 Add a `GET /master-shift-templates/:id` query (extend `useMasterShiftTemplateQueries.ts`; `createCrudService` already exposes get-by-id, wire a `useMasterShiftTemplate(id)` hook if not already present) — already present as `useGetMasterShiftTemplate`
- [x] 1.2 Confirm `useSubShiftTemplateComposition` (or equivalent list-by-master query) can be used to fetch a template's sub-shift templates for the detail page without changes — `useGetSubShiftTemplatesByMasterShiftTemplate` reused as-is

## 2. Detail page route

- [x] 2.1 Create `src/app/(dashboard)/shifts/[id]/page.tsx` reading `id` from route params
- [x] 2.2 Build the page header: back link to `/shifts`, template name + time range as heading, Edit/Duplicate/Archive actions (overflow menu for less-frequent actions on small screens)
- [x] 2.3 Build the Overview section (compact, read-only: name, start time, end time, status) using existing shadcn Card/Badge
- [x] 2.4 Wire loading and not-found states for an invalid/missing `id`

## 3. Sub Shifts section

- [x] 3.1 Build a Sub Shift card component (name, time range, task count, status, overflow menu) replacing the drawer's `SubShiftTemplateSection` list rendering
- [x] 3.2 Render the Sub Shifts section as a card grid/list sourced from the template's sub-shift templates, MAIN slots first ordered by `startTime`, then SUPPORT ordered by `startTime` (matching existing ordering rule)
- [x] 3.3 Add the empty state (message + "Add Sub Shift" action) when a template has zero sub-shift templates
- [x] 3.4 Wire "Add Sub Shift" and per-card "Edit"/"Delete" actions to the existing `SubShiftTemplateForm` Dialog (reuse as-is; only the trigger/container changes)
- [x] 3.5 Show each sub-shift card's task count by querying its task templates (filtered by `subShiftTemplateId` once 4.x lands)

## 4. Task management moves into the Sub Shift Dialog

- [x] 4.1 Add a task checklist section to the Sub Shift edit Dialog (reuse `task-template-section.tsx`'s add/edit form logic, adapted to render inside the Dialog)
- [x] 4.2 Pass the current `subShiftTemplateId` on task create/update instead of only `masterShiftTemplateId`
- [x] 4.3 Scope task list queries/mutations by `subShiftTemplateId`
- [x] 4.4 Remove the flat, master-scoped `TaskTemplateSection` usage from the detail page

## 5. Master shift template editing

- [x] 5.1 Build the master-edit Dialog reusing `MasterShiftTemplateForm` unchanged, opened from the detail page's "Edit" action
- [x] 5.2 Wire the create flow (list's "Add" action) to open the same Dialog in create mode; on success, navigate to the new template's detail page
- [x] 5.3 Wire the "Duplicate" action to open the same Dialog pre-filled (existing `handleDuplicate` logic), and after the source template's sub-shift templates are replayed, navigate to the new template's detail page — moved to the detail page's action menu, not the list row (see design.md)
- [x] 5.4 Wire "Archive" to the existing status-update mutation, invoked from the detail page's action row/overflow menu

## 6. List page updates

- [x] 6.1 Update `src/features/masterShiftTemplate/components/list.tsx` / `src/app/(dashboard)/shifts/page.tsx` row action to navigate (`router.push`) to `/shifts/:id` instead of opening the Drawer
- [x] 6.2 Remove Drawer-related state (`selectedTemplateId`, `open`) from `shifts/page.tsx` once navigation replaces it

## 7. Cleanup

- [x] 7.1 Delete `src/features/masterShiftTemplate/components/detail.tsx` (the Drawer) once the detail page is verified end to end
- [x] 7.2 Confirm `src/components/shared/drawer-form.tsx` remains used by `branch`, `employee`, and `users` and is left untouched
- [x] 7.3 Manually verify no other code path references the removed Drawer component (grep for `MasterShiftTemplateDetail`)

## 8. Verification

- [x] 8.1 Manually walk: list → open detail page → edit master fields → add/edit/remove sub-shift → add/edit/remove a task inside a sub-shift → duplicate → archive — verified by user
- [x] 8.2 Verify empty state renders for a template with zero sub-shift templates — verified by user
- [x] 8.3 Verify responsive behavior: sections stack, cards go full-width, secondary actions collapse into overflow menu on small screens — user found the page's content width didn't match the list page (centered `max-w-4xl` vs. the list's full-width layout); fixed by dropping the centering wrapper so the detail page spans the same width as the list page
- [ ] 8.4 Run `pnpm lint` and fix any issues introduced — `pnpm lint` fails repo-wide on a pre-existing broken dependency (`Cannot find package '@eslint/js'`), confirmed via `git stash` on a clean checkout; unrelated to this change. Ran `tsc --noEmit` instead, which passed with no errors.
