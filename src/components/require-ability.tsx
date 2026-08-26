"use client";

import { ReactNode } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { usePageAbility } from "@/lib/hooks/usePageAbility";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

/**
 * Gates a dashboard page's rendered content on the current user's CASL
 * ability, in addition to the authentication check `AuthGuard` already does.
 * Renders in place (same layout/sidebar) rather than redirecting - the user
 * is authenticated, just not authorized for this page. See design.md
 * Decision 2.
 */
export function RequireAbility({
  action,
  subject,
  children,
}: {
  action: string;
  subject: string;
  children: ReactNode;
}) {
  const { allowed, isLoading } = usePageAbility(action, subject);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <Alert variant="destructive">
        <ShieldAlert />
        <AlertTitle>Không có quyền truy cập</AlertTitle>
        <AlertDescription>Bạn không có quyền truy cập trang này.</AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}
