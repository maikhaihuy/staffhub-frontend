"use client";

import { useGetRole } from "@/features/roles/hooks/useRoleQueries";
import PermissionMatrix from "@/features/roles/components/permission-matrix";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RequireAbility } from "@/components/require-ability";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function RoleDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const roleId = Number(params.id);

  const { data: role, isLoading } = useGetRole(roleId);

  return (
    <RequireAbility action="read" subject="roles">
      {isLoading || !role ? (
        <p>Loading...</p>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              className="self-start gap-1"
              onClick={() => router.push("/roles")}
            >
              <ChevronLeft className="h-4 w-4" />
              Back to roles
            </Button>
            <div className="px-2 flex items-center gap-2">
              <h1 className="text-2xl font-semibold">{role.name}</h1>
              {role.isSystemRole && <Badge variant="secondary">System</Badge>}
            </div>
            {role.description && (
              <div className="px-2 text-sm text-muted-foreground">
                {role.description}
              </div>
            )}
          </div>
          <PermissionMatrix role={role} />
        </div>
      )}
    </RequireAbility>
  );
}
