"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetPermissionCatalog,
  useGetPermissions,
  useGetRolePermissions,
} from "@/features/permissions/hooks/usePermissionQueries";
import {
  useAssignRolePermissions,
  useRemoveRolePermission,
} from "@/features/permissions/hooks/usePermissionMutations";
import { Permission, PermissionGrant } from "@/features/permissions/types";
import {
  PermissionScope,
  buildConditionForScope,
  describeScope,
  isScopeSupported,
  scopeFromCondition,
} from "@/features/permissions/utils/condition";
import { useGetUsers } from "@/features/users/hooks/useUserQueries";
import { Role } from "../types";
import PermissionMatrixConfirmDialog, {
  MatrixChange,
} from "./permission-matrix-confirm-dialog";

type CellState = {
  checked: boolean;
  scope: PermissionScope;
  customJson?: string;
};

type MatrixState = Record<number, CellState>;

function initialStateFromGrants(
  permissions: Permission[],
  grants: { permissionId: number; condition?: unknown | null }[]
): MatrixState {
  const grantByPermissionId = new Map(
    grants.map((g) => [g.permissionId, g.condition])
  );
  const state: MatrixState = {};
  for (const permission of permissions) {
    const hasGrant = grantByPermissionId.has(permission.id);
    const condition = grantByPermissionId.get(permission.id) as
      | Record<string, unknown>
      | null
      | undefined;
    const scope = hasGrant ? scopeFromCondition(condition) : "none";
    state[permission.id] = {
      checked: hasGrant,
      scope,
      customJson: scope === "custom" && condition ? JSON.stringify(condition) : undefined,
    };
  }
  return state;
}

type PermissionMatrixProps = {
  role: Role;
};

export default function PermissionMatrix({ role }: PermissionMatrixProps) {
  const { data: permissions = [], isLoading: isPermissionsLoading } =
    useGetPermissions();
  const { data: grants = [], isLoading: isGrantsLoading } =
    useGetRolePermissions(role.id);
  const { data: catalog } = useGetPermissionCatalog();
  const { data: users = [] } = useGetUsers();

  const [state, setState] = useState<MatrixState>({});
  const [initialState, setInitialState] = useState<MatrixState>({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (permissions.length === 0) return;
    const next = initialStateFromGrants(permissions, grants);
    setState(next);
    setInitialState(next);
  }, [permissions, grants]);

  const assignMutation = useAssignRolePermissions(role.id);
  const removeMutation = useRemoveRolePermission(role.id);

  const permissionsBySubject = useMemo(() => {
    const groups = new Map<string, Permission[]>();
    for (const permission of permissions) {
      const list = groups.get(permission.subject) ?? [];
      list.push(permission);
      groups.set(permission.subject, list);
    }
    return groups;
  }, [permissions]);

  const affectedUserCount = users.filter((u) =>
    u.roles?.some((r) => r.id === role.id)
  ).length;

  const changes: MatrixChange[] = useMemo(() => {
    const result: MatrixChange[] = [];
    for (const permission of permissions) {
      const before = initialState[permission.id];
      const after = state[permission.id];
      if (!before || !after) continue;
      const beforeScope = before.checked ? before.scope : "none";
      const afterScope = after.checked ? after.scope : "none";
      if (beforeScope !== afterScope) {
        result.push({
          permissionId: permission.id,
          action: permission.action,
          subject: permission.subject,
          beforeLabel: before.checked ? describeScope(before.scope) : "Not granted",
          afterLabel: after.checked ? describeScope(after.scope) : "Not granted",
        });
      }
    }
    return result;
  }, [permissions, state, initialState]);

  const setCell = (permissionId: number, patch: Partial<CellState>) => {
    setState((prev) => ({
      ...prev,
      [permissionId]: { ...prev[permissionId], ...patch },
    }));
  };

  const handleConfirm = async () => {
    const toUpsert: PermissionGrant[] = [];
    const toRemove: number[] = [];

    for (const change of changes) {
      const cell = state[change.permissionId];
      if (cell.checked) {
        toUpsert.push({
          permissionId: change.permissionId,
          condition: buildConditionForScope(cell.scope, change.subject, catalog, cell.customJson),
        });
      } else {
        toRemove.push(change.permissionId);
      }
    }

    if (toUpsert.length > 0) {
      await assignMutation.mutateAsync(toUpsert);
    }
    for (const permissionId of toRemove) {
      await removeMutation.mutateAsync(permissionId);
    }

    setInitialState(state);
    setConfirmOpen(false);
  };

  if (isPermissionsLoading || isGrantsLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {permissions.length} permissions across{" "}
          {permissionsBySubject.size} subjects
        </div>
        <Button
          disabled={changes.length === 0}
          onClick={() => setConfirmOpen(true)}
        >
          Save changes
        </Button>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              <TableHead className="w-1/12"></TableHead>
              <TableHead className="w-2/12">Action</TableHead>
              <TableHead className="w-4/12">Scope</TableHead>
              <TableHead className="w-4/12">Custom JSON</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...permissionsBySubject.entries()].map(([subject, subjectPermissions]) => (
              <Fragment key={subject}>
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={4} className="font-medium">
                    {subject}
                  </TableCell>
                </TableRow>
                {subjectPermissions.map((permission) => {
                  const cell = state[permission.id] ?? { checked: false, scope: "none" as PermissionScope };
                  const selfSupported = isScopeSupported("self", catalog, subject);
                  const managedBranchesSupported = isScopeSupported("managedBranches", catalog, subject);
                  return (
                    <TableRow key={permission.id}>
                      <TableCell>
                        <Checkbox
                          checked={cell.checked}
                          onCheckedChange={(checked) =>
                            setCell(permission.id, {
                              checked: !!checked,
                              scope: checked ? cell.scope === "none" ? "none" : cell.scope : cell.scope,
                            })
                          }
                        />
                      </TableCell>
                      <TableCell>{permission.action}</TableCell>
                      <TableCell>
                        <Select
                          disabled={!cell.checked}
                          value={cell.scope}
                          onValueChange={(value) =>
                            setCell(permission.id, { scope: value as PermissionScope })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No restriction</SelectItem>
                            <SelectItem
                              value="self"
                              disabled={!selfSupported}
                              title={selfSupported ? undefined : `"${subject}" has no $self field mapping`}
                            >
                              Own records only
                            </SelectItem>
                            <SelectItem
                              value="managedBranches"
                              disabled={!managedBranchesSupported}
                              title={
                                managedBranchesSupported
                                  ? undefined
                                  : `"${subject}" has no $managedBranches field mapping`
                              }
                            >
                              Managed branches only
                            </SelectItem>
                            <SelectItem value="custom">Custom JSON</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {cell.checked && cell.scope === "custom" && (
                          <Input
                            placeholder='{"branchId": 1}'
                            value={cell.customJson ?? ""}
                            onChange={(e) =>
                              setCell(permission.id, { customJson: e.target.value })
                            }
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
      <PermissionMatrixConfirmDialog
        open={confirmOpen}
        setOpen={setConfirmOpen}
        changes={changes}
        affectedUserCount={affectedUserCount}
        onConfirm={handleConfirm}
        isSubmitting={assignMutation.isPending || removeMutation.isPending}
      />
    </div>
  );
}
