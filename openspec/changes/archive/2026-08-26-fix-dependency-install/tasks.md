## 1. Fix `package.json`

- [x] 1.1 Remove the `"ui": "github:shadcn/ui"` entry from `dependencies` (unused - all
      shadcn components already live under `src/components/ui`).
- [x] 1.2 Change `@eslint/js` in `devDependencies` from `^10.0.1` to `^9` so it matches
      `eslint@^9`. (`eslint-config-next@15.3.2`'s `peerDependencies` only allow
      `eslint@^7 || ^8 || ^9`, so aligning down to `^9` is correct - not upgrading
      `eslint` to `^10`.)

## 2. Regenerate the lockfile and verify

- [x] 2.1 Run `pnpm install` to regenerate `pnpm-lock.yaml` and confirm it completes with
      no `ERESOLVE`/git-dependency errors and no leftover `shadcn/ui` entries.
- [x] 2.2 Run `pnpm lint` and `pnpm build` to confirm the reduced `@eslint/js` version and
      removed `ui` package don't break linting or the build. Confirmed on a clean
      `rm -rf node_modules && pnpm install`: the `ERESOLVE`/git-workspace error and the
      `context.getAncestors is not a function` crash (from `@eslint/js@^10` on an
      ESLint-9-only rule API) are both gone. `pnpm lint`/`pnpm build` still surface ~33
      pre-existing lint errors and one empty page file (`src/app/(auth)/forgot-password/page.tsx`,
      0 bytes since commit `b493c34`) - confirmed these predate this change and are
      unrelated to the dependency fix. Left as a follow-up, out of scope here.
- [x] 2.3 Grep the repo for any remaining reference to the `ui` package (imports from
      `"ui"`) to confirm removing the dependency is safe.

## 3. Guard against regression

- [ ] 3.1 ~~Add a CI workflow~~ - deferred. Wiring `pnpm lint`/`pnpm build` into CI now
      would go red immediately on the pre-existing issues noted in 2.2, which are out of
      scope for this change. Revisit once those are fixed separately.
