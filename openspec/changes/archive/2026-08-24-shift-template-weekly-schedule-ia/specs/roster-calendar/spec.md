## ADDED Requirements

### Requirement: Week navigation controls the displayed week
The page SHALL let the admin move to the previous week, the next week, or jump back to the current week, and SHALL re-fetch master shifts (and dependent assignment queries) for the newly selected week's date range.

#### Scenario: Navigating to next week
- **WHEN** the admin clicks the "next week" control
- **THEN** the grid's day columns advance by seven days and the page fetches master shifts for the new `from`/`to` range

#### Scenario: Returning to the current week
- **WHEN** the admin clicks "this week" after navigating away
- **THEN** the grid returns to the week containing today's date

### Requirement: Empty template/day cells offer a Generate action
For a template/day cell with no matching master shift, the page SHALL offer a "Generate" action that calls `POST /master-shifts/generate` with that cell's `masterShiftTemplateId` and date, and SHALL replace the empty cell with the newly generated shift on success. The action SHALL be disabled per the `master-shift-template` capability's generation-eligibility rule when the template has no sub-shift templates.

#### Scenario: Generating a shift from an empty cell
- **WHEN** the admin clicks "Generate" on an empty cell for a template/day
- **THEN** the system calls generate for that template and date, and the cell then renders the resulting master shift's sub-shifts

#### Scenario: Bulk-generating the displayed week
- **WHEN** the admin clicks a branch-level "Generate this week" action
- **THEN** the system calls generate for every template/day combination in the displayed week that does not yet have a master shift, skipping combinations that already do

### Requirement: Sub-shift rows offer an Assign action
Each rendered sub-shift row SHALL offer an "Assign" action that opens an employee-assignment dialog (employee picker plus optional note), creating an assignment via the existing `assignment` capability's create endpoint and reflecting it in the row on success.

#### Scenario: Assigning an employee to a sub-shift
- **WHEN** the admin uses the Assign action on a sub-shift row and selects an employee
- **THEN** the system creates an assignment for that `subShiftId`/`employeeId` and the row shows the newly assigned employee

### Requirement: Weekly Schedule page links back to Shift Templates
The page header SHALL include a link to the Shift Templates page (`/shifts`), scoped to the currently selected branch, so a manager can jump to adjust a template's structure without losing their place.

#### Scenario: Jumping to Shift Templates from the Weekly Schedule page
- **WHEN** the admin clicks "Manage Shift Templates" on the Weekly Schedule page
- **THEN** the system navigates to `/shifts` with the same branch pre-selected
