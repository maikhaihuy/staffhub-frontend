## Context

Shipped in `shift-template-weekly-schedule-ia` and live today at `/shifts`:
- A list page (`MasterShiftTemplateList` + columns in `shifts/page.tsx`): Name, Abbreviation, Time range, Status, a "N MAIN Â· N SUPPORT" composition badge, and row actions (View in Weekly Schedule, Edit, Delete).
- A create/edit surface (`MasterShiftTemplateDetail`): a right-side `Drawer` (bottom sheet on mobile, via the shared `DrawerForm`) with the master fields form, then - once the template has an id - a `SubShiftTemplateSection` (list + add/edit `Dialog`) and a `TaskTemplateSection` (flat title+type list).
- Validation today: required master fields; MAIN-vs-MAIN overlap, checked client-side in `findMainOverlapConflict` and surfaced as inline errors on the Start/End time fields.

Two things are still missing that this change adds: sub-shifts are just a text list with no visual sense of how they tile the day, and there's no bounding check (a sub-shift can currently be saved outside its master's range) or Duplicate action. This document specs both the new pieces and the full state matrix (empty/validation/responsive) for the screens that already exist, since that was never written down.

## Goals / Non-Goals

**Goals:**
- One glance at the timeline should answer "does this shift template's staffing make sense" - MAIN slots tile the day, SUPPORT slots visibly overlay them.
- Bounding validation prevents a structurally nonsensical template (a sub-shift outside its master's hours) the same way MAIN-overlap validation already does.
- Duplicate gives a fast starting point for "same shape, different branch/day-part" templates without re-entering every sub-shift by hand.
- Keep using shadcn primitives already in the codebase (`Drawer`, `Dialog`, `Badge`, `GenericTable`) - the timeline is the one genuinely new visual element, and it's a plain positioned-`div` bar chart, not a charting library.

**Non-Goals:**
- No drag-to-resize on the timeline (per the product brief: no drag-and-drop builders). It is a live, read-oriented visualization of whatever's in the sub-shift list; all edits happen through the existing Add/Edit dialog.
- No lane-packing algorithm for overlapping SUPPORT slots (see Decision 1). One row per sub-shift is enough for MVP density.
- No task dependencies, recurrence, or due dates (unchanged from the existing minimal task list).
- No backend changes; Duplicate is a client-side copy into a new create flow.

## Terminology

| Internal / API term | UI label |
|---|---|
| `MasterShiftTemplate` | **Shift Template** |
| `SubShiftTemplate` | **Sub-shift** (already used in the sub-shift-template section header) |
| `type: MAIN` | **Main** |
| `type: SUPPORT` | **Support** |
| Shift Templates list page | **Shift Templates** (nav label stays "Loại ca làm việc" per existing i18n copy) |
| Create/Edit drawer title | **Create Shift Template** / **Edit Shift Template** (already correct - no change) |

Never surface `masterShiftTemplateId`, `subShiftTemplateId`, or DTO field names in UI copy or error messages.

## Screens

### 1. Shift Templates list (`/shifts`)

Unchanged layout: branch selector + "New" button in the header, a table below. One row change:

- **Row actions become four, in this order**: View in Weekly Schedule, **Duplicate (new)**, Edit, Delete. Duplicate sits next to Edit since it's a peer "start editing" action, not a destructive one - keeping Delete last and visually separated (existing `ghost` variant, slightly more spacing) avoids misclicks.
- **Composition badge stays**: "2 Main Â· 1 Support" (relabeled from "MAIN"/"SUPPORT" to title case per the terminology table) or the existing red "No sub-shifts" warning badge.

#### Empty state
No change from today: the table's existing `emptyMessage` ("No data available.") covers "this branch has no shift templates yet." Add a friendlier message + inline "Create your first shift template" affordance pointing at the same New button, since a first-run branch is a real path (every branch starts here).

#### Duplicate interaction
- Click "Duplicate" on a row → immediately (no confirmation dialog - it's non-destructive) opens the create drawer **pre-filled** with that template's Name (suffixed " (Copy)"), Abbreviation, Start/End time, Status reset to `DRAFT` (a duplicate shouldn't silently go live), and Note.
- The drawer opens in **create mode** (no id yet), so the "save sub-shifts/tasks first" gate still applies for children - but the moment the admin hits Save on the basic fields, the system creates the new master template **and then replays the source template's sub-shift templates** (not tasks - see Decision 2) as `POST /sub-shift-templates` calls against the new template's id, so the timeline is populated immediately without the admin re-entering three time ranges by hand.
- If any replayed sub-shift fails to create (rare - e.g. a race with the source being deleted), show a toast per failure and leave the successfully-copied ones in place; the admin can fix up the rest manually. Don't roll back the whole duplicate over a partial failure.

### 2 & 3. Create / Edit Shift Template (drawer)

Same drawer, same three sections top-to-bottom - this is the existing structure, now with the timeline inserted:

```
┌ Drawer (right side desktop / bottom sheet mobile) ─────┐
│ Title: "Create Shift Template" / "Edit Shift Template" │
├──────────────────────────────────────────────────────── │
│ A. Basic Information                                    │
│    Name, Abbreviation, Start time, End time, Status, Note│
├──────────────────────────────────────────────────────── │
│ B. Sub-shifts                              [+ Add]      │
│    ┌ Timeline (new - see below) ┐                       │
│    └────────────────────────────┘                       │
│    List: Main #1 [Main]  08:00-12:00        [Edit][Del] │
│          Main #2 [Main]  12:00-16:00        [Edit][Del] │
│          Support [Support] 10:00-16:00      [Edit][Del] │
├──────────────────────────────────────────────────────── │
│ C. Tasks                                                 │
│    [title input] [type select] [Add]                    │
│    Open register [Mandatory]                    [Del]   │
├──────────────────────────────────────────────────────── │
│ Footer: [Save] [Discard]                                 │
└──────────────────────────────────────────────────────── │
```

- The timeline sits **above** the sub-shift list, inside section B, directly under the "Sub-shifts" heading and before the "+ Add" button's list. It's the first thing the admin sees once they scroll past the basic fields.
- Section B and C stay disabled-with-a-hint until the template exists (create mode, pre-save) - unchanged from today's "Save the template first..." message, which now also mentions the timeline: *"Save the template first to add sub-shift templates - you'll see them here as a timeline."*
- Editing Start/End time in section A after sub-shifts already exist re-validates every existing sub-shift against the new range on next save attempt (see Validation states) rather than silently orphaning them.

### 4. Add/Edit Sub-shift (dialog)

Existing dialog (Name, Type, Start time, End time, Max assignments, Note) gains one addition:

- **A single-row mini-timeline preview** between the Type field and the Start/End time fields, showing just *this* sub-shift's current (possibly invalid, live-typed) range as a bar against the master template's range, with the master's boundary always visible as the track's full extent. This turns "your times are outside 08:00-16:00" from a sentence into something the admin sees while typing, before they even hit Save.
- The preview bar renders in a neutral color while valid, and switches to a red/hatched treatment on the portion(s) that fall outside the master range or that overlap a conflicting MAIN slot, matching whichever error is currently active.

### 5. Delete / Duplicate

- **Delete** (list row and sub-shift row) - unchanged `window.confirm` pattern already in place; no change needed. Deleting a master template does not need a "used in generated shifts" warning: `master-shift`/`sub-shift` already decouple from their template once generated (per the existing `master-shift` spec), so deletion is always safe.
- **Duplicate** - covered above; the only new list-level interaction.

## The Timeline component

This is the piece the brief calls out as most important, so it gets its own spec.

**Shape**: a vertical stack of rows sharing one horizontal scale (0% = master `startTime`, 100% = master `endTime`). One row per item:

```
Shift Template   08:00 |████████████████████████████| 16:00
Main #1           |████████|
Main #2                    |████████|
Support                |████████████████|
                   08  09  10  11  12  13  14  15  16
```

- **Row 1 (always present, even with zero sub-shifts): the master template itself.** A full-width, lightly-filled bar labeled with the template's own name and time range. This is the visual "boundary" every other row is measured against - it's why it's a row and not just an axis.
- **Row order below it: all Main sub-shifts first (sorted by `startTime`), then all Support sub-shifts (sorted by `startTime`).** Grouping by type (rather than interleaving by time) keeps the "these tile the day" structure (Main) visually separate from "these float on top" (Support), which matches how the domain actually works.
- **Bar position/width**: `left = (subStart - masterStart) / masterDuration * 100%`, `width = (subEnd - subStart) / masterDuration * 100%`, computed in minutes from the same `HH:mm` values already on the form/entity - no new time library.
- **Color/style**: Main bars use the primary solid fill (matching the existing `Badge` "default" variant used for `MAIN` today); Support bars use a lighter/secondary fill with a subtle border, so a glance distinguishes "structure" from "overlay" even before reading the row label.
- **Labels**: each row's label (name + type badge, matching the list below it) sits to the left of the bar on desktop; on narrow widths it sits above the bar instead (see Responsive).
- **Axis**: hour tick marks under the master row when the drawer is wide enough to space them legibly (roughly every 1-2 hours depending on the template's total span); on narrow layouts, only the master row's own start/end labels are shown, no intermediate ticks.
- **Live updates**: the timeline reads directly from the same sub-shift-template list query the list-below already uses (`useGetSubShiftTemplatesByMasterShiftTemplate`) - no separate fetch, no separate state to keep in sync. Adding/editing/removing a sub-shift refetches that query (existing `invalidateKey` behavior) and the timeline re-renders with it.
- **Not interactive**: no click-to-edit, no drag. It's a read model of the list below; all mutation still goes through the Add/Edit dialog and the list's Edit/Delete buttons. (Rejected: click-a-bar-to-edit - see Decision 3.)

## Component hierarchy

```
ShiftTemplatesPage (/shifts)
├─ MasterShiftTemplateList
│   └─ GenericTable
│       └─ row actions: ViewInWeeklySchedule (Link) · Duplicate (new) · Edit · Delete
└─ MasterShiftTemplateDetail (Drawer)
    ├─ MasterShiftTemplateForm            (A. Basic Information)
    ├─ SubShiftTemplateSection            (B. Sub-shifts)
    │   ├─ SubShiftTemplateTimeline (new)  - reads the same query as the list below
    │   ├─ [sub-shift row]xN (existing list)
    │   └─ Dialog › SubShiftTemplateForm
    │       └─ SubShiftMiniTimelinePreview (new) - single-row live preview
    └─ TaskTemplateSection                (C. Tasks, unchanged)
```

`SubShiftTemplateTimeline` and `SubShiftMiniTimelinePreview` share one small pure function - `computeBarPosition(masterRange, subRange) → { leftPct, widthPct, isOutOfBounds }` - so the "is this bar out of the master's range" logic isn't duplicated between the read-only timeline and the live dialog preview.

## UX behavior

- **Dirty-state gating is unchanged**: Save/Discard on the master form stay disabled until the form is dirty, exactly as today.
- **Sub-shift dialog Save** re-runs both validations (MAIN-overlap, new bounding check) before submitting; the first failing rule wins and sets the same inline field errors pattern already used for overlap (`form.setError` on `startTime`/`endTime`), so both rules read identically to the admin - just different messages.
- **Duplicate** never mutates the source template; it only reads it once to seed the create form and replay its sub-shifts after the new template saves.
- **Timeline scroll**: if a template's span is unusually long relative to the drawer width (rare, but not disallowed), the timeline area scrolls horizontally as a unit (all rows scroll together, labels stay pinned) rather than shrinking bars to illegibility.

## Empty states

| Surface | Empty condition | Treatment |
|---|---|---|
| Shift Templates list | Branch has zero templates | Friendly empty message + "Create your first shift template" CTA (existing New button) |
| Timeline | Template has zero sub-shifts | Timeline shows only the master row with a muted "Add a sub-shift to see it here" caption in place of the missing rows - not hidden entirely, so the master's own range is still visible as a reference while the admin adds the first one |
| Sub-shift list (below timeline) | Same as above | Existing copy: "No sub-shift templates yet. Add at least one before this template can be generated." |
| Tasks | No tasks yet | Existing copy: "No tasks yet." (unchanged) |

## Validation / error states

| Rule | Where shown | Message pattern |
|---|---|---|
| Master Name/Start/End required | Master form, inline `FormMessage` | Existing Zod messages ("Name is required", etc.) - unchanged |
| Master End time after Start time | Master form | **New**: currently unvalidated - add `endTime > startTime` check, inline on the End time field |
| Sub-shift Name/Type/Start/End required | Sub-shift dialog, inline `FormMessage` | Unchanged |
| Sub-shift End time after Start time | Sub-shift dialog | **New**, same pattern as master |
| MAIN vs MAIN overlap | Sub-shift dialog, `startTime`/`endTime` field errors | Existing: `Overlaps with MAIN sub-shift "X" (start - end)` |
| **New**: sub-shift outside master's time range | Sub-shift dialog, `startTime`/`endTime` field errors + mini-timeline overflow highlight | `Must be within the shift template's hours (start - end)` |
| Duplicate replay partial failure | Toast per failed sub-shift (list stays open on the new template) | `Couldn't copy sub-shift "X" - add it manually` |

Bounding and MAIN-overlap are independent checks; if a candidate sub-shift fails both, show the bounding message first (it's the more fundamental error - "you're not even inside the template" trumps "you collide with a sibling").

## Mobile / responsive behavior

- **Drawer**: already becomes a bottom sheet on mobile via the shared `DrawerForm`/`useIsMobile` - no change needed there.
- **Timeline**:
  - **Desktop/tablet (drawer width ≥ ~420px, the existing `sm:max-w-xl` drawer)**: label left of bar, hour ticks shown.
  - **Mobile (bottom sheet, full viewport width but often shorter)**: label moves **above** its bar (stacked), hour ticks dropped to just the master row's start/end, and row height increases slightly for touch-friendly spacing between rows. Bars remain proportional - they don't switch to a non-visual list on mobile, since "see the structure at a glance" matters at least as much on a phone as on desktop.
  - Minimum bar width: a very short sub-shift (e.g. 30 min in a 12-hour template) still renders at a minimum ~12px width so it stays clickable/visible rather than disappearing to a sliver; label truncates with the full range available on tap/hover (title attribute) rather than wrapping the row.
- **List/table**: `GenericTable` already handles narrow viewports by horizontal scroll (existing behavior) - Duplicate's icon-only button follows the same `size="icon"` pattern as the other row actions, so it doesn't add width pressure beyond one more icon.

## Decisions

1. **One row per sub-shift, no lane-packing for overlapping Support slots.** Two overlapping Support rows just render as two rows, each individually proportional - no attempt to pack them into shared lanes when they don't collide. Simpler to build and read; revisit only if real templates commonly have 3+ overlapping Support slots (MVP assumption: they don't).
2. **Duplicate replays sub-shifts, not tasks.** Tasks are more likely to be branch/operation-specific text ("Count register drawer #3") that doesn't make sense copied verbatim, whereas sub-shift time structure is exactly what's being reused. Admins can copy-paste task titles manually if needed; not automating it avoids duplicating stale/wrong operational text silently.
3. **Timeline is read-only, not click-to-edit.** A click-to-edit bar would need drag-resize to be useful (the brief explicitly excludes drag-and-drop) or would just duplicate the existing Edit button one click away for no real gain - so it stays a pure visualization, keeping the component simple and the interaction model single-path (always through the dialog).
4. **Bounding validation is a hard block, not a warning.** Consistent with how MAIN-overlap already hard-blocks; a structurally invalid sub-shift (outside its own template's hours) has no legitimate use case, unlike, say, a SUPPORT overlap which is intentional by design.
