import { createMongoAbility, MongoAbility } from "@casl/ability";
import { AbilityRule } from "@/features/permissions/types";

export type AppAbility = MongoAbility;

/**
 * `AbilityRuleDto.conditions` is already resolved server-side (e.g. `$self`
 * substituted against the target identity) before it reaches the frontend,
 * so this is a direct pass-through into CASL's raw rule shape - no token
 * resolution happens here.
 */
export function buildAbility(rules: AbilityRule[]): AppAbility {
  return createMongoAbility(
    rules.map((rule) => ({
      action: rule.action,
      subject: rule.subject,
      conditions: rule.conditions,
      inverted: rule.inverted,
    }))
  );
}
