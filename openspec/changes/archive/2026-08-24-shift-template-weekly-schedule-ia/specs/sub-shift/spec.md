## MODIFIED Requirements

### Requirement: One default sub-shift is auto-created per master shift
The frontend SHALL render every sub-shift generated for a master shift, one per the source template's `SubShiftTemplate`s, instead of assuming a single default `MAIN` sub-shift. A master shift with multiple generated sub-shifts (e.g. two `MAIN` slots plus a `SUPPORT` slot) SHALL show all of them in its calendar cell.

#### Scenario: Rendering a master shift's sub-shifts
- **WHEN** a calendar cell renders a master shift with more than one sub-shift
- **THEN** it lists every entry in `masterShift.subShifts`, not just `masterShift.subShifts[0]`

#### Scenario: Rendering a master shift with a single sub-shift
- **WHEN** a calendar cell renders a master shift with exactly one sub-shift
- **THEN** it shows that one sub-shift, preserving prior single-sub-shift behavior
