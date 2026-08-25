# permission-simulator Specification

## Purpose

Lets admins preview any user's resolved effective permissions and debug why a specific action+subject check would pass or fail, without needing to log in as that user.

## Requirements

### Requirement: Permission Preview shows a user's resolved effective permissions
Admins SHALL be able to pick any user and view that user's resolved effective permissions rendered in plain language (e.g. "Can approve Overtime Request — own records only"), derived from `GET /users/:id/abilities`.

#### Scenario: Preview a manager's permissions
- **WHEN** an admin selects a Manager-role user in the simulator
- **THEN** the system shows each granted action+subject with its scope described in plain language, including the specific managed branches where applicable

#### Scenario: Preview a user with no linked employee
- **WHEN** an admin selects a user with no linked employee record
- **THEN** the simulator shows an empty permission set rather than erroring

### Requirement: Simulator explains a specific denied check
Given a target user, an action, and a subject, the simulator SHALL indicate whether that check would pass, and if denied, SHALL state the reason: no matching rule found for the action+subject, or a matching rule's condition was not satisfied by the supplied resource attributes.

#### Scenario: Debug a denied action
- **WHEN** an admin picks a user, action `"approve"`, subject `"OvertimeRequest"`, and a resource whose attributes don't satisfy the matching rule's `condition` (e.g. it isn't the user's own record for an `$self`-scoped grant)
- **THEN** the simulator reports the check as denied and explains that the matching rule's condition was not met

#### Scenario: Debug a denial caused by an inverted rule
- **WHEN** the target user's resolved rules include an `inverted: true` rule for the checked action+subject
- **THEN** the simulator reports the check as denied and explains that an explicit "cannot" rule applies

#### Scenario: Debug a check with no matching rule
- **WHEN** an admin picks a user and an action+subject pair the user's roles hold no permission for at all
- **THEN** the simulator reports the check as denied because no matching rule exists, distinct from a condition failure
