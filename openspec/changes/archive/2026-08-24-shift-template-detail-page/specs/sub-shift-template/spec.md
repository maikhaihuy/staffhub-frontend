## MODIFIED Requirements

### Requirement: Sub-shift template CRUD scoped to a master shift template
The system SHALL create, list, update, and delete sub-shift templates via `/sub-shift-templates` REST endpoints. Each sub-shift template SHALL require `branchId`, `masterShiftTemplateId`, `name`, `type` (`MAIN`/`SUPPORT`), `startTime`, and `endTime`; `maxAssignments`, `sortOrder`, `status` (`DRAFT`/`ACTIVE`/`INACTIVE`/`ARCHIVED`), and `note` are optional. Sub-shift templates SHALL be displayed as cards in the master template's detail page's Sub Shifts section, and added or edited via a Dialog (not a Drawer).

#### Scenario: Adding a sub-shift template from the detail page
- **WHEN** an admin adds a sub-shift template from the "Add Sub Shift" action on a master shift template's detail page
- **THEN** the system sends `POST /sub-shift-templates` with the current `masterShiftTemplateId` and the entered fields, and a new card appears in the detail page's Sub Shifts section on success

#### Scenario: Removing a sub-shift template
- **WHEN** an admin confirms removal of a sub-shift template from its card's overflow menu on the detail page
- **THEN** the system sends `DELETE /sub-shift-templates/:id` and removes its card from the Sub Shifts section on success
