## Context

`/rosters` (component tree: `page.tsx` → `branch-calendar-table.tsx` → `calendar-slot-cell.tsx` → `assign-employee-dialog.tsx`, with `generate-cell.tsx` for empty slots) currently renders a CSS grid: one row per `MasterShiftTemplate`, one column per day, each cell a colored box holding every sub-shift's time, assignment count, assign-icon, and assignment chips. That layout was inherited from a generic "calendar grid" starting point, not designed around the manager's actual task, which per the domain model is per-day: look at today's (or a given day's) generated shifts, see who's assigned to each sub-shift, and fix gaps.

Domain shape driving this design (unchanged by this proposal):
- `MasterShiftTemplate` → generates → `MasterShift` (a dated instance, e.g. "Morning Operation, Mon Aug 31, 08:00-16:00")
- `SubShiftTemplate` → generates → `SubShift` (a dated slot inside a `MasterShift`, e.g. "Main #1, 08:00-12:00")
- `Assignment` links an `Employee` to a `SubShift`

## Goals / Non-Goals

**Goals:**
- Lay the week out the way a manager reads it: by day, then by operational shift, then by sub-shift slot.
- Make "who's assigned" and "what's unassigned" scannable without opening anything.
- Keep the assignment interaction to the three clicks the proposal specifies: click the slot's select → pick an employee → confirm. No drag targets, no modal for the common path.
- Ship something a developer can build from this doc without re-deriving layout decisions.

**Non-Goals:**
- No time-axis / hour-ruler calendar view (that's the Google-Calendar complexity being explicitly avoided).
- No drag-and-drop reassignment.
- No conflict detection beyond capacity (over-`maxAssignments`) and a stale/unavailable-employee note - no double-booking-across-branches checks, no labor-law/hour-limit checks.
- No change to the generate/assign backend contracts (`POST /master-shifts/generate`, assignment create endpoint) - this is presentation and interaction only.
- Export-to-Excel/PDF and the aggregate summary-cards row are not redesigned here; left as an explicit open question (see below) rather than silently dropped.

## Decisions

### 1. Desktop layout
Single scrollable column, full content width (no more forced 8-column grid). Top to bottom: page header (title + branch tabs, as today) → week navigator → a vertical stack of seven day sections (Mon-Sun) → nothing below (summary cards removed from this view, see Open Questions). Each day section is a full-width block; shift cards inside it lay out as a single column on desktop too - stacking, not a side-by-side grid - because a manager reviewing a day reads shifts top-to-bottom in start-time order, and a multi-column card grid re-introduces the "hunt across cells" problem this redesign removes. Day sections are visually separated by a header rule (day name + date) rather than boxed in a table cell.

**Alternative considered:** a masonry/column grid of shift cards per day (side-by-side on wide screens). Rejected because it reintroduces spatial scanning cost for a small win (fewer scroll pixels), and empty/light days (weekends) would look inconsistent next to busy days.

### 2. Weekly navigation
Keep the existing three controls (Previous week / This week / Next week) and week-range label unchanged in position and behavior - they already satisfy "easy navigation between weeks" and match the existing `roster-calendar` requirement. Add a compact day-jump: a row of seven day-abbreviation chips (Mon..Sun) directly under the week navigator that scrolls the page to that day's section on click. This gives fast access to "today" or "Thursday" without adding a second navigation paradigm (no swipe, no picker widget).

**Alternative considered:** collapsible day accordions (one day open at a time). Rejected - a manager scanning for gaps across the week wants everything visible at once; forcing one-at-a-time defeats "clear day grouping" as a scanning tool. Long pages are an acceptable trade-off for a single-branch, single-week dataset (a handful of templates x 7 days).

### 3. Shift card design (Master Shift container)
Each generated `MasterShift` renders as one card:
- Header row: shift name (e.g. "Morning Operation") + its time range ("08:00 - 16:00"), using the same deterministic per-template color used today, but as a left accent bar / header background tint rather than filling the whole card - the current solid-color-fill-with-white-text approach hurts readability for dense assignment text.
- Body: one row per sub-shift, ordered MAIN slots by `startTime` then SUPPORT slots by `startTime` (same ordering already established for the template timeline in `master-shift-template`).
- No card-level actions beyond what the sub-shift rows themselves offer - the card is a grouping container, not an interactive unit.

If a `MasterShift` has zero sub-shifts (a template generated before it had any `SubShiftTemplate`s), the card shows a single muted line ("No sub-shifts configured for this template") instead of an empty body - mirrors the existing `calendar-slot-cell.tsx` empty-subshift branch.

### 4. Sub-shift row design
One row per `SubShift`, laid out as: label (sub-shift name, e.g. "Main #1") + time range, then the assignment control (see #5) right-aligned. Capacity is shown as a small `count/max` badge next to the control only when `maxAssignments` is set (unset means uncapped - showing "0/—" would be misleading). Rows within a card are separated by a hairline, not nested boxes, to keep the card visually flat and scannable.

### 5. Employee assignment interaction (click → select → confirm)
Replace the icon-that-opens-a-dialog pattern with an inline `Select` on the row itself, matching the structure the user's sketch shows (`Main #1 [ Minh ▼ ]`):
- **Unassigned slot:** the select shows placeholder text "Unassigned" (styled per #6) and lists eligible employees (branch-scoped, matching the existing `availableEmployees` filter logic already in `calendar-slot-cell.tsx`). Picking a name doesn't assign immediately - it stages the choice and reveals an inline confirm/cancel affordance (small check/x button pair replacing the select's trailing icon) so the click→select→confirm sequence the proposal specifies is real, not implicit-on-select. Confirm fires the same `useCreateAssignment` mutation used today.
- **Assigned slot (capacity 1, the common case):** the select shows the assigned employee's name as its current value. Reassigning follows the same select→confirm sequence; confirming a different employee creates the new assignment (existing create endpoint - no update/replace endpoint is assumed to exist, so this proposal does not require one: MVP treats reassignment as "assign someone else," leaving removal of the prior assignment as a manual follow-up action, matching current backend capability).
- **Assigned slot (capacity > 1, i.e. `maxAssignments` > 1):** the row shows the existing assignees as small chips (name only, matching today's chip style) plus a persistent "+ Add" inline trigger that opens the same select→confirm control for adding one more, as long as `assignments.length < maxAssignments`. This preserves the current dialog's multi-assignment capability without bringing back the modal.
- Attendance display (actual check-in/out times or status badge, and the "adjusted" highlight) is unchanged from today's `roster-calendar` requirement - it renders under/alongside the chip once an assignment exists.

**Alternative considered:** assign-on-select with no separate confirm step (native `<select>` semantics). Rejected because the proposal explicitly asks for "click → select → confirm," and a bare select firing a mutation on every keyboard/arrow interaction is also an easy source of accidental assignments.

### 6. Empty / unassigned states
- **Unassigned sub-shift:** the row gets a distinct warning treatment - amber/yellow left border or background tint on the row (not the whole card) plus the select placeholder reading "Unassigned" in the same warning color, so a manager scanning a day sees gaps as color, not text. This must not be the sole indicator (see accessibility note in Risks) - the literal word "Unassigned" always accompanies the color.
- **Day with no generated shifts yet:** the day section shows a single muted card: "No shifts generated for this day" plus a "Generate" affordance if any branch template is eligible (reuses `generate-cell.tsx`'s eligibility check), replacing today's bare `+` icon in an empty grid cell with a labeled button/text link.
- **Template with zero sub-shift templates:** covered by #3's card-level empty state; this is a template-authoring gap the manager should fix on `/shifts`, not something to work around here.

### 7. Conflict / warning states
Scope intentionally narrow per Non-Goals:
- **Over-capacity:** if `assignments.length > maxAssignments` (possible if capacity was lowered after assigning), show a small warning badge on the row ("Over capacity") in addition to the chips - informational only, no blocking action, since resolving it means removing an assignment, which is a manual action outside this MVP's scope.
- **Employee no longer eligible:** if an assigned employee is not in the current `availableEmployees` set for the branch (e.g. removed from the branch after being assigned), show a small inline note next to their chip ("no longer in this branch") rather than hiding them - the assignment still exists and attendance may still need tracking.
- No other conflict classes (overlapping assignments across branches, exceeding weekly hours, etc.) are in scope.

### 8. Mobile / responsive behavior
- Day sections keep stacking vertically (no layout change needed - this was already true of the old grid's rows, but now every element benefits, not just the row labels).
- Shift cards go full-width; the sub-shift row's label/time and its assignment control wrap to two lines under ~400px width (label+time on line one, select+chips on line two) rather than truncating either.
- The day-jump chip row (#2) becomes a horizontally scrollable strip on narrow viewports instead of wrapping, so it stays a single reachable row.
- Branch tabs and week navigation controls already wrap today (`flex-wrap`); keep that behavior.
- No separate mobile-only component tree - this is CSS-level responsiveness on the same components, consistent with the rest of the app's Tailwind-driven responsive approach.

### 9. Component hierarchy
Replacing the current tree:
```
rosters/page.tsx                         (unchanged: branch tabs, week anchor state)
  WeeklyScheduleView (was branch-calendar-table.tsx)
    WeekNavigator                        (prev/this-week/next - existing logic, extracted)
    DayJumpStrip                         (new: 7 day chips, scrolls to section)
    DaySchedule x7                       (new: one per weekday)
      MasterShiftCard x N                (new: replaces the per-cell colored box)
        SubShiftRow x N                  (new: replaces calendar-slot-cell.tsx's SubShiftRow)
          AssignmentControl              (new: inline select + confirm/cancel, replaces assign-employee-dialog.tsx for the common path)
          AssignmentChip x N             (existing chip rendering, extracted from calendar-slot-cell.tsx)
      EmptyDayCard                       (new: shown when a day has zero MasterShifts, hosts the Generate affordance)
```
`generate-cell.tsx`'s eligibility hook (`useSubShiftTemplateComposition`) and mutation (`useGenerateMasterShift`) are reused as-is inside `EmptyDayCard` and any per-template "generate for this day" affordance; only the button's visual treatment changes (labeled, not icon-only).

### 10. UX rules for MVP
- Every unassigned slot is always visible as unassigned - never collapsed, hidden, or requiring a click to reveal.
- Every assignment action is reversible only via re-selecting (no undo/redo, no confirmation-of-removal flow beyond what the existing create endpoint supports).
- No optimistic UI beyond what `useAppMutation`'s existing toast/invalidate pattern already provides - assignment state shown is always server-confirmed.
- Color communicates status as reinforcement, never as the only signal (text label or icon always pairs with color, for colorblind/contrast accessibility).
- One employee-assignment control open (in "selecting" state) at a time is fine to leave unenforced - this is a low-traffic manager tool, not a high-concurrency editor; no need for cross-row state coordination.

## Risks / Trade-offs

- [Longer single-page scroll for branches with many templates] → Mitigated by the day-jump strip (#2); if this proves insufficient in practice, a future iteration can add a sticky mini-nav, but that's explicitly deferred rather than built speculatively.
- [Removing the icon+dialog assignment flow changes an interaction users may already be used to] → The proposal explicitly asks for this change; scope is limited to sub-shifts with capacity 1-2, which is the common case per the example data.
- [Color-only unassigned indicator risks accessibility gaps] → Mitigated by pairing color with the literal "Unassigned" text and an icon, per UX rule in #10; verify contrast ratios against the design system's existing amber/warning token during implementation.
- [Dropping summary cards/export buttons from this view without a replacement] → Flagged as an explicit open question below rather than silently deleted; do not remove them from the codebase until that question is answered.

## Migration Plan

- This is a UI-only change to one route (`/rosters`); no data migration, no API version bump.
- Implement the new component tree alongside the old one is unnecessary - the old grid components (`branch-calendar-table.tsx`, `calendar-slot-cell.tsx`, `assign-employee-dialog.tsx`, `generate-cell.tsx`'s visual shell) are replaced directly, since this is a pre-production internal tool with no external consumers of the old markup/DOM structure.
- Rollback is a plain git revert of the component changes if the new layout doesn't work for managers in practice.

## Open Questions

- Where do the Total Shifts / Total Assignments / Total Capacity / Active Employees summary cards and the Export to Excel/PDF buttons (currently non-functional stubs) belong after this redesign - kept above the day sections, moved to a separate summary panel, or dropped entirely? Proposal marks them out of scope; resolve before or during implementation rather than defaulting silently.
- Should the day-jump strip default-scroll to "today" on page load when the displayed week includes today, or always start at Monday? Left to implementation judgment unless the user has a preference.
