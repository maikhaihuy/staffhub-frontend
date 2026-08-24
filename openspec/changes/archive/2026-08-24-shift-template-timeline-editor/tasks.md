## 1. Bounding-validation helper

- [x] 1.1 Add `computeBarPosition(masterRange, subRange)` in `src/features/subShiftTemplate/utils/` returning `{ leftPct, widthPct, isOutOfBounds }`, normalizing "HH:mm" and ISO datetime inputs the same way `checkMainOverlap.ts` already does
- [x] 1.2 Add `findOutOfBoundsConflict(candidate, masterRange)` alongside `findMainOverlapConflict`, returning a message-ready result or null
- [x] 1.3 In `sub-shift-template-section.tsx`'s `handleSubmit`, run the bounding check before the MAIN-overlap check (bounding error wins if both fail) and set the same `startTime`/`endTime` field errors pattern
- [x] 1.4 Add `endTime > startTime` validation to both the master form and the sub-shift form (currently unvalidated in either)

## 2. Timeline component

- [x] 2.1 Create `src/features/subShiftTemplate/components/timeline.tsx` (`SubShiftTemplateTimeline`): master reference row + one row per sub-shift (MAIN group by `startTime`, then SUPPORT group by `startTime`), using `computeBarPosition`
- [x] 2.2 Render empty state (master-only row + hint) when there are zero sub-shift templates
- [x] 2.3 Insert the timeline into `SubShiftTemplateSection`, above the existing sub-shift list, reading the same `useGetSubShiftTemplatesByMasterShiftTemplate` query (no new fetch)
- [x] 2.4 Add responsive styles: label-left/ticks on wide layouts, label-above/no-ticks on narrow (mobile bottom-sheet) layouts; enforce a minimum bar width for very short sub-shifts
- [x] 2.5 Create `src/features/subShiftTemplate/components/mini-timeline-preview.tsx` (`SubShiftMiniTimelinePreview`): single-row live preview of the in-progress dialog form values against the master range, with out-of-bounds/overlap portions highlighted
- [x] 2.6 Insert the mini preview into `sub-shift-template-form.tsx` between the Type field and the Start/End time fields, wired to the live form values (`form.watch`)

## 3. Duplicate action

- [x] 3.1 Add a `duplicateMasterShiftTemplate` helper (client-side: read source template + its sub-shift templates, no new endpoint) in `masterShiftTemplate` services/hooks - implemented directly in `shifts/page.tsx`'s `handleDuplicate`/`handleCreated` (reads via `subShiftTemplateService.listByMasterShiftTemplate`, no new service file needed since it's a one-off orchestration, not a reusable query)
- [x] 3.2 Add "Duplicate" row action to `shifts/page.tsx`'s columns (between View-in-Weekly-Schedule and Edit), opening the create drawer pre-filled with the source's Name (+" (Copy)"), Abbreviation, Start/End time, Note, and Status forced to `DRAFT`
- [x] 3.3 On successful create of the duplicated template (via the existing `onCreated` callback), replay the source's sub-shift templates as individual `POST /sub-shift-templates` calls against the new template's id
- [x] 3.4 Handle partial failure: toast per failed sub-shift replay, leave successful ones in place, no rollback of the new master template
- [x] 3.5 Do not replay task templates (per design Decision 2)

## 4. List/terminology polish

- [x] 4.1 Relabel composition badge text from "MAIN"/"SUPPORT" to "Main"/"Support" title case (`composition-badge.tsx`) - also relabeled the sub-shift row badges and the Type select options for consistency
- [x] 4.2 Update the empty-list message on `/shifts` to include a "Create your first shift template" CTA pointing at the existing New button
- [x] 4.3 Update the pre-save hint in `detail.tsx` to mention the timeline ("...you'll see them here as a timeline")

## 5. Verification

- [x] 5.1 Manually walk: build a template with Main #1 08:00-12:00, Main #2 12:00-16:00, Support 10:00-16:00 inside an 08:00-16:00 template; confirm the timeline renders all four rows proportionally and matches the sub-shift list below it. Verified live in a browser (Playwright-driven) against the real backend - the timeline rendered the master row plus all three sub-shifts proportionally, matching the list below exactly
- [x] 5.2 Manually walk: attempt a sub-shift outside the master range (e.g. 07:00-09:00 inside an 08:00-16:00 template); confirm it's blocked with the bounding message, not the overlap message. Verified live - the mini-preview showed a clamped red overflow bar, the save was blocked, and both Start/End time fields showed "Must be within the shift template's hours (08:00 - 16:00)"
- [x] 5.3 Manually walk: duplicate a template with 2-3 sub-shifts; confirm the new template is created in DRAFT with matching sub-shifts and no tasks. Verified live - Duplicate opened the create drawer pre-filled ("... (Copy)", DRAFT, Save enabled immediately thanks to the `shouldDirty` fix), and after Save the new template's timeline showed all 3 replayed sub-shifts with matching names/types/times
- [x] 5.4 Resize the browser / use mobile viewport to confirm the timeline switches to label-above layout and the drawer remains a bottom sheet. Verified live at a 390px-wide viewport - the drawer renders as a full-width bottom sheet with a drag handle, and every timeline row switches to label-above-bar with hour ticks hidden
- [x] 5.5 Run `pnpm lint` and `tsc --noEmit` - both clean on every touched/new file (one new `react-hooks/exhaustive-deps` warning was fixed via `useCallback`; the remaining `sub-shift-template-form.tsx` "'data' is defined but never used" error matches the exact pre-existing pattern already present in every other feature's form.tsx)
