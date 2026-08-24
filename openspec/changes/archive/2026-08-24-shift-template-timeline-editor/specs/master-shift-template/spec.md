## ADDED Requirements

### Requirement: Template edit surface shows a proportional visual timeline of its sub-shifts
The master shift template edit surface SHALL render a visual timeline showing the master template's own time range as a reference row, plus one row per sub-shift template (MAIN slots first ordered by `startTime`, then SUPPORT slots ordered by `startTime`), each positioned and sized proportionally to its time range within the master's range.

#### Scenario: Timeline reflects the current sub-shift list
- **WHEN** a master shift template has "Main #1" 08:00-12:00, "Main #2" 12:00-16:00, and "Support" 10:00-16:00, inside a template ranging 08:00-16:00
- **THEN** the timeline renders four rows (the master, then Main #1, Main #2, Support) with each sub-shift bar's horizontal position and width proportional to its time range against the 08:00-16:00 master span

#### Scenario: Timeline updates after adding a sub-shift
- **WHEN** an admin adds a new sub-shift template while the edit surface is open
- **THEN** the timeline shows a new row for it without requiring the admin to close and reopen the template

#### Scenario: Timeline with no sub-shifts yet
- **WHEN** a master shift template has zero sub-shift templates
- **THEN** the timeline shows only the master row, with a hint that adding a sub-shift will show it there

### Requirement: Shift Templates list supports duplicating a template
The Shift Templates list SHALL offer a "Duplicate" action per template that opens the create flow pre-filled with that template's basic fields (name suffixed to indicate it's a copy, status reset to `DRAFT`) and, once the new template is saved, replays the source template's sub-shift templates against the new template's id.

#### Scenario: Duplicating a template with sub-shifts
- **WHEN** an admin clicks "Duplicate" on a template that has two MAIN and one SUPPORT sub-shift template, and saves the resulting pre-filled create form
- **THEN** the system creates a new master shift template and then creates three new sub-shift templates against it, matching the source template's names, types, and time ranges

#### Scenario: Duplicate does not copy tasks
- **WHEN** an admin duplicates a template that has task templates attached
- **THEN** the new template is created with no tasks; the admin adds any needed tasks manually

#### Scenario: Partial failure while replaying sub-shifts
- **WHEN** one of the source template's sub-shift templates fails to be created against the new template during duplication
- **THEN** the system shows an error for that one sub-shift, leaves the successfully-copied sub-shift templates in place, and does not roll back the newly created master template
