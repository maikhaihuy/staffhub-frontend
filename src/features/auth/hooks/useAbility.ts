"use client";

import { useMemo } from "react";
import { useAppQuery } from "@/lib/hooks/common/useAppQuery";
import { queryKeys } from "@/lib/queryKeys";
import { abilityService } from "@/features/permissions/services/ability.service";
import { buildAbility } from "@/lib/casl/ability";
import { useAuth } from "../context/AuthContext";

/**
 * Hydrates the current admin's own CASL ability from GET /me/abilities.
 * Keyed by userId so switching logged-in users rebuilds rather than
 * momentarily showing the previous user's cached rules.
 */
export function useAbility() {
  const { user, isAuthenticated } = useAuth();

  const { data: rules = [], isLoading } = useAppQuery(
    queryKeys.abilities.me(user?.id),
    abilityService.getMine,
    { enabled: isAuthenticated && !!user }
  );

  const ability = useMemo(() => buildAbility(rules), [rules]);

  return { ability, isLoading };
}
