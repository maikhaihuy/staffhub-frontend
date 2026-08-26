_Priority: medium_

## Why
`src/features/roster/services/roster.service.ts` and
`src/features/schedule/services/schedule.service.ts` are entirely mocked (`setTimeout` stubs
returning spliced mock data, with debug typos like `"ferch scheduels"`) and unused — nothing in
`src/app` imports the hooks built on top of them; the live rosters/schedule pages use the
`masterShift`/`assignment` feature slices instead. They still ship in the bundle and could
mislead a future contributor into wiring them up expecting real data.

## What Changes
- Confirm via a repo-wide search that `useRosterQueries`/`useRosterMutations`/
  `useScheduleQueries`/`useScheduleMutations` are truly unreferenced.
- Delete `src/features/roster/` and `src/features/schedule/` if confirmed dead, or wire them to
  the real API and delete the mocks if two parallel paths were actually intended (unlikely —
  verify with whoever owns this area before deleting outright).

## Capabilities
(none — cleanup)

## Impact
`src/features/roster/*`, `src/features/schedule/*`, `src/mocks/data/rosters.ts`,
`src/mocks/data/schedules.ts` (check for other consumers before deleting the mock data files).
