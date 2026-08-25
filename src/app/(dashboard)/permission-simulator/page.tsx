"use client";

import { useMemo, useState } from "react";
import { subject as caslSubject } from "@casl/ability";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetUsers } from "@/features/users/hooks/useUserQueries";
import { useGetUserAbilities } from "@/features/permissions/hooks/usePermissionQueries";
import { buildAbility } from "@/lib/casl/ability";

function describeCondition(conditions?: Record<string, unknown>): string {
  if (!conditions || Object.keys(conditions).length === 0) return "No restriction";
  return `Limited to: ${JSON.stringify(conditions)}`;
}

export default function PermissionSimulatorPage() {
  const { data: users = [] } = useGetUsers();
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>();

  const { data: rules = [], isLoading } = useGetUserAbilities(selectedUserId ?? 0);
  const ability = useMemo(() => buildAbility(rules), [rules]);

  const [checkAction, setCheckAction] = useState("");
  const [checkSubject, setCheckSubject] = useState("");
  const [resourceJson, setResourceJson] = useState("");
  const [result, setResult] = useState<{ allowed: boolean; reason: string } | null>(null);

  const handleCheck = () => {
    if (!checkAction || !checkSubject) return;

    let resourceAttrs: Record<string, unknown> = {};
    if (resourceJson.trim()) {
      try {
        resourceAttrs = JSON.parse(resourceJson);
      } catch {
        setResult({ allowed: false, reason: "Resource attributes are not valid JSON." });
        return;
      }
    }

    const instance = caslSubject(checkSubject, resourceAttrs);
    const allowed = ability.can(checkAction, instance);
    // relevantRuleFor only returns a rule whose conditions already match
    // (see CASL's Ability#relevantRuleFor), so it can't distinguish "no rule
    // at all" from "a rule exists but its condition wasn't satisfied" - both
    // come back null. possibleRulesFor ignores conditions entirely, giving
    // us the most relevant rule regardless of whether it matched, so we can
    // check its `inverted`/`matchesConditions` separately for the three
    // denial reasons this simulator surfaces.
    const subjectType = ability.detectSubjectType(instance);
    const rule = ability.possibleRulesFor(checkAction, subjectType)[0] ?? null;

    if (!rule) {
      setResult({ allowed: false, reason: "No matching rule found for this action+subject." });
    } else if (rule.inverted) {
      setResult({ allowed: false, reason: "An explicit \"cannot\" rule applies." });
    } else if (!allowed) {
      setResult({
        allowed: false,
        reason: "A matching rule exists but its condition wasn't satisfied by the given resource attributes.",
      });
    } else {
      setResult({ allowed: true, reason: "Allowed." });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="px-2 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Permission Simulator</h1>
        <div className="text-sm font-medium text-muted-foreground">
          Pick a user to see their resolved effective permissions, and debug
          why a specific action+subject check would pass or fail.
        </div>
      </div>

      <div className="flex flex-col gap-2 max-w-sm">
        <Label>User</Label>
        <Select
          value={selectedUserId ? String(selectedUserId) : undefined}
          onValueChange={(value) => setSelectedUserId(Number(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a user" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={String(user.id)}>
                {user.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedUserId && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-medium">Resolved effective permissions</h2>
          {isLoading ? (
            <p>Loading...</p>
          ) : rules.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              This user has no resolved permissions.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {rules.map((rule, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Badge variant={rule.inverted ? "destructive" : "outline"}>
                    {rule.inverted ? "Cannot" : "Can"}
                  </Badge>
                  <span className="font-medium">
                    {rule.action} {rule.subject}
                  </span>
                  <span className="text-muted-foreground">
                    — {describeCondition(rule.conditions)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <h2 className="text-lg font-medium mt-4">Debug a specific check</h2>
          <div className="flex flex-row gap-2 items-end flex-wrap">
            <div className="flex flex-col gap-1">
              <Label>Action</Label>
              <Input
                placeholder="approve"
                value={checkAction}
                onChange={(e) => setCheckAction(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label>Subject</Label>
              <Input
                placeholder="OvertimeRequest"
                value={checkSubject}
                onChange={(e) => setCheckSubject(e.target.value)}
                className="w-48"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label>Resource attributes (optional JSON)</Label>
              <Input
                placeholder='{"employeeId": 42}'
                value={resourceJson}
                onChange={(e) => setResourceJson(e.target.value)}
                className="w-64"
              />
            </div>
            <Button onClick={handleCheck} disabled={!checkAction || !checkSubject}>
              Check
            </Button>
          </div>

          {result && (
            <div className="flex items-center gap-2 text-sm">
              <Badge variant={result.allowed ? "outline" : "destructive"}>
                {result.allowed ? "Allowed" : "Denied"}
              </Badge>
              <span>{result.reason}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
