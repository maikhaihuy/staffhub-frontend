_Priority: medium, quick fix_

## Why
A clean `npm install` currently fails: `eslint ^9` (devDependency) conflicts with
`@eslint/js ^10` (`ERESOLVE`), and `"ui": "github:shadcn/ui"` separately fails on its own
`workspace:*` reference when resolved outside a monorepo. That `"ui"` dependency is never
imported anywhere in `src` (every shadcn component already lives directly under
`src/components/ui`) — it's redundant as well as broken.

## What Changes
- Remove the `"ui": "github:shadcn/ui"` dependency entirely.
- Align `@eslint/js` to a `^9` release compatible with `eslint ^9` (or upgrade `eslint` to `^10`
  if that's otherwise desired — pick one, don't leave them mismatched).
- Verify `npm install` succeeds clean afterward; add a CI step to catch this class of regression
  if one doesn't already exist.

## Capabilities
(none)

## Impact
`package.json`, `package-lock.json`.
