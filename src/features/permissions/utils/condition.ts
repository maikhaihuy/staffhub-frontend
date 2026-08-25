import { PermissionCondition } from "../types";

export type PermissionScope = "none" | "self" | "managedBranches" | "custom";

/**
 * Backend hasn't published a per-subject field-name catalog for the `$self`
 * token yet (design.md Backend Dependency #4 / tasks.md 4.6) - `employeeId`
 * matches design.md's own worked example and is used as the default until
 * that's confirmed. Subjects that need a different field can still be
 * expressed via the "Custom JSON" scope.
 */
export const SELF_CONDITION_FIELD = "employeeId";

export function buildConditionForScope(
  scope: PermissionScope,
  customJson?: string
): PermissionCondition | undefined {
  switch (scope) {
    case "none":
      return undefined;
    case "self":
      return { [SELF_CONDITION_FIELD]: "$self" };
    case "managedBranches":
      // Not yet buildable - $managedBranches/ManagerBranch don't exist
      // backend-side (design.md Backend Dependency #2). Scope is disabled
      // in the UI; this branch exists only for exhaustiveness.
      return { branchId: { $in: "$managedBranches" } };
    case "custom":
      if (!customJson) return undefined;
      try {
        return JSON.parse(customJson);
      } catch {
        return undefined;
      }
  }
}

export function scopeFromCondition(
  condition: PermissionCondition | null | undefined
): PermissionScope {
  if (!condition) return "none";
  const json = JSON.stringify(condition);
  if (json.includes('"$self"')) return "self";
  if (json.includes("$managedBranches")) return "managedBranches";
  return "custom";
}

export function describeScope(scope: PermissionScope): string {
  switch (scope) {
    case "none":
      return "No restriction";
    case "self":
      return "Own records only";
    case "managedBranches":
      return "Managed branches only";
    case "custom":
      return "Custom JSON";
  }
}
