## MODIFIED Requirements

### Requirement: Template edit surface composes nested sub-shift templates
The master shift template's detail surface SHALL be a dedicated page at a stable, navigable URL (e.g. `/shifts/:id`), reached from the Shift Templates list, rather than a Drawer. The page SHALL let an admin view the master template's fields, and add, edit, and remove that template's `SubShiftTemplate`s (via the `sub-shift-template` capability's Dialog-based add/edit), without navigating away from the page.

#### Scenario: Opening a template's detail page
- **WHEN** an admin selects a template from the Shift Templates list
- **THEN** the system navigates to that template's detail page at a stable URL, which the admin can bookmark, reload, or reach via browser back/forward

#### Scenario: Editing a template's sub-shift templates from the detail page
- **WHEN** an admin adds, edits, or removes a sub-shift template from the detail page's Sub Shifts section
- **THEN** the corresponding Dialog opens for that action and, on save or cancel, closes back to the same detail page without a full navigation

### Requirement: Template edit surface manages a minimal task list
Task templates (`title`, `type`: `SHARED_MANDATORY`/`SHARED_OPTIONAL`/`DEDICATED`) SHALL be managed per sub-shift template, scoped by the task's existing `subShiftTemplateId` field, rather than as a flat list at the master template level. An admin SHALL add, edit, and remove a sub-shift template's tasks from within that sub-shift template's edit Dialog, using the existing `/task-templates` endpoints. Due dates, cross-sub-shift task assignment, and recurrence remain out of scope.

#### Scenario: Adding a task to a sub-shift template
- **WHEN** an admin adds a task titled "Open register" with type `SHARED_MANDATORY` while editing a sub-shift template's Dialog
- **THEN** the task is persisted via `/task-templates` with that sub-shift template's id as `subShiftTemplateId`, and appears in that sub-shift template's task checklist

#### Scenario: Sub-shift card reflects its task count
- **WHEN** a sub-shift template has 5 tasks
- **THEN** the detail page's Sub Shifts section shows "5 tasks" on that sub-shift's card without requiring the admin to open its edit Dialog

## ADDED Requirements

### Requirement: Detail page header shows primary actions and supports back navigation
The template detail page SHALL show a back link to the Shift Templates list, the template's name and time range as the page heading, and primary actions (Edit, Duplicate, Archive) positioned together near the heading. Less frequent or destructive actions MAY be grouped into an overflow menu.

#### Scenario: Navigating back to the list
- **WHEN** an admin clicks the back link on a template's detail page
- **THEN** the system returns to the Shift Templates list

#### Scenario: Editing the master template's own fields
- **WHEN** an admin clicks "Edit" on the detail page
- **THEN** a Dialog opens with the master template's fields (name, abbreviation, start/end time, status, note); saving updates the template and closes the Dialog back to the same detail page

### Requirement: Detail page shows an empty state when a template has no sub-shift templates
When a master shift template has zero sub-shift templates, the detail page's Sub Shifts section SHALL show an empty state (instead of an empty list) that prompts the admin to add one, in place of rendering no content.

#### Scenario: Detail page for a template with zero sub-shift templates
- **WHEN** an admin opens the detail page for a template that has no sub-shift templates yet
- **THEN** the Sub Shifts section shows an empty-state message and an "Add Sub Shift" action, instead of an empty area
