## Why

The Shift Template editor (`/shifts`) already lets admins compose a master template out of MAIN/SUPPORT sub-shift templates (shipped in `shift-template-weekly-schedule-ia`), but it only shows that composition as a plain list of rows - a manager has to read three time ranges and mentally reconstruct how they overlap. The domain's whole point (MAIN slots tile the day, SUPPORT slots float on top) is inherently visual and doesn't come through in a list. The editor also has no validation stopping a sub-shift from falling outside its master template's time range, and no way to duplicate a template as a starting point for a similar one - both of which admins will hit as soon as they manage more than a couple of templates.

## What Changes

- Add a visual timeline to the Shift Template create/edit surface: a proportional bar for the master shift template's own range, with MAIN sub-shifts laid edge-to-edge on one lane and SUPPORT sub-shifts on a separate lane so overlap is visible at a glance, updating live as sub-shifts are added/edited/removed.
- Add a validation rule: a sub-shift template's time range SHALL fall within its master shift template's time range (in addition to the existing MAIN-vs-MAIN overlap rule).
- Add a "Duplicate" action to the Shift Templates list, alongside the existing Edit/Delete, that copies a template's fields and all of its sub-shift templates into a new, unsaved-until-confirmed template.
- Document (as design, not new code beyond what's listed above) the full page layouts, component hierarchy, empty states, validation states, and responsive behavior for the existing list/create/edit/add-sub-shift screens, since this was previously built ad hoc without a documented spec for those states.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `master-shift-template`: adds the visual timeline requirement on the edit surface, and the Duplicate action on the list.
- `sub-shift-template`: adds the "must fall within the master template's time range" validation rule alongside the existing MAIN-overlap rule.

## Impact

- Frontend only: `src/features/masterShiftTemplate/*` (list actions, detail drawer layout), `src/features/subShiftTemplate/*` (new timeline component, updated validation), `src/app/(dashboard)/shifts/page.tsx` (Duplicate action wiring).
- No backend/API changes - duplication is a client-side "prefill a new create form from an existing template's data" flow using the same `/master-shift-templates` and `/sub-shift-templates` create endpoints already in use; no new endpoint needed.
- No change to the Weekly Schedule (`/rosters`) page or the `assignment`/`roster-calendar` capabilities.
