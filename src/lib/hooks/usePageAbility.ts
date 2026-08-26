"use client";

import { useAbility } from "@/features/auth/hooks/useAbility";

/**
 * Page-level ability check, built on the already-hydrated CASL instance from
 * `useAbility()` (fetched once per session). Used to gate a page's rendered
 * content, not just its sidebar nav entry - see design.md Decision 1.
 */
export function usePageAbility(action: string, subject: string) {
  const { ability, isLoading } = useAbility();

  return { allowed: ability.can(action, subject), isLoading };
}
