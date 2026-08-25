import { PermissionCatalogEntry, PermissionCondition } from "../types";

export type PermissionScope = "none" | "self" | "managedBranches" | "custom";

/**
 * GET /permissions/catalog (tasks.md 4.6) is the source of truth for which
 * subjects support which condition tokens and what field(s) they resolve
 * against, but it has a confirmed gap: `attendance-history` has a live
 * seeded `$self` condition (`{"assignment":{"is":{"employeeId":1}}}`,
 * observed via GET /users/:id/abilities) with no matching catalog entry.
 * This fallback covers that one known gap; anything else uncovered by the
 * catalog falls back to "Custom JSON".
 */
const SELF_FIELD_FALLBACK: Record<string, string> = {
  "attendance-history": "assignment.is.employeeId",
};

function findToken(
  catalog: PermissionCatalogEntry[] | undefined,
  subject: string,
  token: "$self" | "$managedBranches"
) {
  return catalog?.find((e) => e.subject === subject)?.conditionTokens.find((t) => t.token === token);
}

export function getSelfField(
  catalog: PermissionCatalogEntry[] | undefined,
  subject: string
): string | undefined {
  return findToken(catalog, subject, "$self")?.fields[0] ?? SELF_FIELD_FALLBACK[subject];
}

/**
 * Confirmed against the live backend: a grant with `{[field]: {in:
 * "$managedBranches"}}` resolves via GET /users/:id/abilities to the
 * user's actual managed-branch ids (e.g. `{"branchId":{"in":[1]}}`, or
 * `{"in":[]}` with none assigned) - verified with a user holding *only*
 * the scoped role. (An earlier session's test wrongly concluded this
 * didn't resolve - that test's user also held a second role with an
 * unconditioned grant for the same action+subject, which wins CASL's
 * multi-role OR-of-conditions union regardless of what the scoped role's
 * condition resolves to; not a resolution failure.)
 */
export function getManagedBranchesField(
  catalog: PermissionCatalogEntry[] | undefined,
  subject: string
): string | undefined {
  return findToken(catalog, subject, "$managedBranches")?.fields[0];
}

export function isScopeSupported(
  scope: PermissionScope,
  catalog: PermissionCatalogEntry[] | undefined,
  subject: string
): boolean {
  switch (scope) {
    case "self":
      return !!getSelfField(catalog, subject);
    case "managedBranches":
      return !!getManagedBranchesField(catalog, subject);
    default:
      return true;
  }
}

export function buildConditionForScope(
  scope: PermissionScope,
  subject: string,
  catalog: PermissionCatalogEntry[] | undefined,
  customJson?: string
): PermissionCondition | undefined {
  switch (scope) {
    case "none":
      return undefined;
    case "self": {
      const field = getSelfField(catalog, subject);
      return field ? { [field]: "$self" } : undefined;
    }
    case "managedBranches": {
      const field = getManagedBranchesField(catalog, subject);
      return field ? { [field]: { in: "$managedBranches" } } : undefined;
    }
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
