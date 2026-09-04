## 1. Verify dead code

- [x] 1.1 Re-confirm no file outside `src/features/roster/` imports from `src/features/roster/` (`grep -rn "features/roster" src`), and no file outside `src/features/schedule/` imports from `src/features/schedule/` (`grep -rn "features/schedule" src`)
- [x] 1.2 Confirm `src/mocks/data/rosters.ts` and `src/mocks/data/schedules.ts` have no consumers other than the two dead service files being removed (`grep -rln "mocks/data/rosters\|mocks/data/schedules" src`)
- [x] 1.3 If either check surfaces a live consumer, stop and escalate per proposal.md (wire it to the real API instead of deleting) rather than proceeding with deletion

## 2. Delete dead feature code

- [x] 2.1 Delete `src/features/roster/` (types, schemas, hooks, services)
- [x] 2.2 Delete `src/features/schedule/` (types, schemas, hooks, services)
- [x] 2.3 Delete `src/mocks/data/rosters.ts` and `src/mocks/data/schedules.ts`

## 3. Clean up dangling references

- [x] 3.1 Search for any remaining imports of the deleted paths (`grep -rn "features/roster\|features/schedule\|mocks/data/rosters\|mocks/data/schedules" src`) and remove/update them
- [x] 3.2 Run `pnpm lint` and `pnpm build` to confirm no broken imports or type errors remain

**Discovered during 3.2:** `pnpm build` surfaced a relative-import chain the path-string greps in section 1 missed: `src/features/branch/schemas.ts` imported `scheduleSchema` (for `branchWithSchedulesSchema`), and `src/mocks/data/branches.ts` imported `sampleSchedules` (for `sampleBranchesWithSchedules`), which itself pulled in `sampleRosters`. Traced every consumer of `branchWithSchedulesSchema` / `BranchWithSchedules` / `useGetBranchesWithSchedules` / `sampleBranchesWithSchedules` and found none outside that same dead chain - same pattern as roster/schedule (mocked, `setTimeout`-stubbed, stray `console.log`, never called from any page). Removed that dead chain from `src/features/branch/{schemas,types}.ts`, `src/features/branch/hooks/useBranchQueries.ts`, `src/mocks/data/branches.ts`, and the unused `queryKeys.branches.withSchedules` key in `src/lib/queryKeys.ts`. `pnpm build` now compiles cleanly (`✓ Compiled successfully`); the remaining lint/type-check failures were confirmed via `git stash` to pre-exist on `develop` and are unrelated to this change.
