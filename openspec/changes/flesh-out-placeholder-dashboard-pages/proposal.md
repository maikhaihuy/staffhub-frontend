_Priority: low, `shipLogs` blocked on backend_

## Why
Three live nav entries — `my-calendars`, `attendanceTracking`, and `shipLogs` — currently render
unmodified Next.js scaffold placeholders with no data or logic. `shipLogs` corresponds to
delivery-receipt tracking, a real spec'd feature; it's blocked on the backend delivery-receipt
model, which doesn't exist yet (see the backend's `add-delivery-receipt-ocr-approval` proposal).

## What Changes
- `my-calendars` and `attendanceTracking`: scope and build out, or explicitly deprioritize/remove
  the nav entry if out of scope for this iteration.
- `shipLogs`: build once the backend delivery-receipt endpoints exist; track as blocked until then.

## Capabilities
(none yet — each page needs its own scoping pass before this becomes a real requirement)

## Impact
`src/app/(dashboard)/my-calendars/page.tsx`, `attendanceTracking/page.tsx`, `shipLogs/page.tsx`.
