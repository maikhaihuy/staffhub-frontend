## ADDED Requirements

### Requirement: Template edit surface composes nested sub-shift templates
The master shift template create/edit surface SHALL let an admin add, edit, and remove that template's `SubShiftTemplate`s (via the `sub-shift-template` capability) without leaving the template's edit surface.

#### Scenario: Editing a template's sub-shift templates inline
- **WHEN** an admin opens a master shift template for editing
- **THEN** the edit surface shows the template's current sub-shift templates alongside the master fields, and adding, editing, or removing one does not navigate away from the template

### Requirement: A template needs at least one sub-shift template to be generation-eligible
A master shift template with zero sub-shift templates SHALL NOT be usable as the source of a `POST /master-shifts/generate` call from the UI.

#### Scenario: Generate action disabled on an empty template
- **WHEN** the Weekly Schedule page offers a Generate action for a template/day cell and that template currently has zero sub-shift templates
- **THEN** the Generate action is disabled, with a hint that the template needs at least one sub-shift template first

### Requirement: Template list surfaces sub-shift-template composition
The Shift Templates list SHALL show, for each template, a summary of its sub-shift-template composition (count by `type`, e.g. "2 MAIN Â· 1 SUPPORT") without requiring the admin to open the edit surface.

#### Scenario: Template with no sub-shift templates yet
- **WHEN** a template has zero sub-shift templates
- **THEN** the list row shows an empty/warning composition indicator instead of a count

### Requirement: Template edit surface manages a minimal task list
The master shift template create/edit surface SHALL let an admin add, edit, and remove a flat list of tasks (`title`, `type`: `SHARED_MANDATORY`/`SHARED_OPTIONAL`/`DEDICATED`) associated with the template, using the existing `/task-templates` endpoints scoped to the template's `masterShiftTemplateId`. Due dates, per-sub-shift task assignment, and recurrence are out of scope for this list.

#### Scenario: Adding an opening checklist item
- **WHEN** an admin adds a task titled "Open register" with type `SHARED_MANDATORY` to a master shift template
- **THEN** the task is persisted via `/task-templates` and appears in the template's task list
