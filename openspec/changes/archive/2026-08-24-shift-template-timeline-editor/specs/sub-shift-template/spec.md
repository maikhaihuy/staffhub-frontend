## ADDED Requirements

### Requirement: Sub-shift templates must fall within their master template's time range
Before saving, the system SHALL reject a sub-shift template whose `startTime`-`endTime` range is not fully contained within its master shift template's `startTime`-`endTime` range.

#### Scenario: Sub-shift starts before the master template opens
- **WHEN** an admin adds or edits a sub-shift template whose `startTime` is earlier than its master template's `startTime`
- **THEN** the system blocks the save and shows an inline validation error stating the sub-shift must be within the template's hours

#### Scenario: Sub-shift ends after the master template closes
- **WHEN** an admin adds or edits a sub-shift template whose `endTime` is later than its master template's `endTime`
- **THEN** the system blocks the save and shows an inline validation error stating the sub-shift must be within the template's hours

#### Scenario: Sub-shift exactly spans the master template's range
- **WHEN** an admin adds a sub-shift template whose `startTime` equals the master template's `startTime` and whose `endTime` equals the master template's `endTime`
- **THEN** the save succeeds, since the range is fully contained (inclusive of the boundary)

### Requirement: Sub-shift template time and type errors are independent of the MAIN-overlap check
When a candidate sub-shift template fails both the bounding check and the MAIN-overlap check, the system SHALL report the bounding error, since a sub-shift outside its own template's hours is invalid regardless of any sibling overlap.

#### Scenario: A MAIN sub-shift is both out of bounds and overlapping
- **WHEN** an admin enters a `MAIN` sub-shift template that is both outside the master template's range and overlapping an existing `MAIN` sibling
- **THEN** the system shows the out-of-bounds error, not the overlap error
