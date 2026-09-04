_Priority: low, `shipLogs` blocked on backend_

## Why
Three live nav entries — `my-calendars`, `attendanceTracking`, and `shipLogs` — currently render
unmodified Next.js scaffold placeholders with no data or logic. `shipLogs` corresponds to
delivery-receipt tracking, a real spec'd feature; it's blocked on the backend delivery-receipt
model, which doesn't exist yet (see the backend's `add-delivery-receipt-ocr-approval` proposal).

## What Changes
- `my-calendars` ("Xem lịch ca"): build a read-only weekly view of the logged-in employee's own
  assignments, reusing the existing `Assignment`/`MasterShift`/`SubShift` query hooks already used
  by `/rosters` and `/my-availabilities/[id]`.
- `attendanceTracking` ("Điểm danh"): build today's-shift status plus check-in/check-out actions
  against the existing `POST /assignments/:id/check-in` and `/check-out` endpoints. Mandatory/todo
  task templates are shown read-only for context; task-completion gating and the evidence
  (photo/note) zone described in CLAUDE.md's Screen Specifications are **not** built here — there
  is no backend model for tracking per-shift task completion yet, so checkout is not blocked on
  them in this iteration.
- `shipLogs`: build once the backend delivery-receipt endpoints exist; track as blocked until then.

## Capabilities
- `staff-schedule-view` (new) — `my-calendars`, self-service weekly schedule.
- `staff-attendance-tracking` (new) — `attendanceTracking`, self-service check-in/check-out.

## Impact
`src/app/(dashboard)/my-calendars/page.tsx`, `attendanceTracking/page.tsx`, `shipLogs/page.tsx`.
