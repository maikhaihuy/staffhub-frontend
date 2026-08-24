## Purpose

Defines how the frontend interprets the backend's field-level validation error shape on 400 responses so admins see errors next to the specific field that caused them, while non-field errors still reach a visible toast/summary.

## ADDED Requirements

### Requirement: Field-level errors are extracted from 400 responses
When an API call fails with HTTP status 400 and the response body includes an `errors` object (a map of field name to a non-empty array of message strings), the system SHALL make each field's messages available to the calling form individually, keyed by field name, rather than only surfacing the response's top-level `message` string.

#### Scenario: Single invalid field
- **WHEN** a create/update request returns 400 with `errors: { "name": ["name should not be empty"] }`
- **THEN** the system associates the message "name should not be empty" with the `name` field

#### Scenario: Multiple invalid fields in one response
- **WHEN** a request returns 400 with `errors` containing both `name` and `email` keys
- **THEN** the system associates each field's own message(s) with that field, without needing to parse the top-level `message` string

#### Scenario: Field with multiple messages
- **WHEN** a field's `errors` entry is an array with more than one message (e.g. `errors.email: ["Email is required.", "Email format is invalid."]`)
- **THEN** the system treats the value as an array and uses at least the first message as that field's displayed error

### Requirement: Dotted and bracket field keys are mapped to the correct form field
The `errors` map's keys SHALL be interpreted as the request body's field path using dot notation for nested objects (e.g. `"employee.email"` is one literal key, not nested access) and bracket-index notation for arrays (e.g. `"items[0].quantity"`). The system SHALL resolve each key to the corresponding field on the client-side form, converting bracket-index segments to the form library's own nested-path syntax where the two differ.

#### Scenario: Nested object field
- **WHEN** a 400 response includes `errors["employee.email"]`
- **THEN** the system applies that message to the form field at path `employee.email`, without attempting `errors.employee.email` property access

#### Scenario: Array item field
- **WHEN** a 400 response includes `errors["items[0].quantity"]`
- **THEN** the system applies that message to the form field representing index 0 of `items`' `quantity`

### Requirement: Non-field errors are routed to a visible summary
When a 400 response's `errors` object includes the reserved key `_general`, the system SHALL surface its message(s) to the user through a visible error summary (e.g. a toast), in addition to — not instead of — any field-level errors present in the same response.

#### Scenario: Business-rule conflict with no specific field
- **WHEN** a request returns 400 with `errors: { "_general": ["the selected shift is not available"] }`
- **THEN** the system shows "the selected shift is not available" in a toast rather than silently dropping it

#### Scenario: General error alongside field errors
- **WHEN** a 400 response includes both `errors._general` and one or more other field keys
- **THEN** the system shows the general message in a toast AND applies the other fields' messages to their respective form fields

### Requirement: Responses without the errors map fall back to the flat message
When an error response has no `errors` key — including all 401/403/404/409/500 responses, and any 400 response that omits `errors` — the system SHALL continue to surface the top-level `message` string as a generic error (e.g. a toast), matching prior behavior.

#### Scenario: Non-400 error status
- **WHEN** a request fails with a 401, 403, 404, 409, or 500 response
- **THEN** the system shows the response's `message` as a generic error, without expecting an `errors` key

#### Scenario: 400 response without an errors key
- **WHEN** a request returns 400 with only `message` and no `errors` key
- **THEN** the system shows `message` as a generic error, matching pre-existing behavior

### Requirement: Successful responses are never treated as errors
A 2xx response SHALL never be interpreted as carrying validation errors, regardless of its body shape.

#### Scenario: Successful submission
- **WHEN** a create/update request succeeds with a 2xx status
- **THEN** the system does not attempt to read an `errors` key from the response and proceeds with normal success handling
