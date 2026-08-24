"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// "Xep ca" is retired in favor of the interactive Weekly Schedule page at
// `/rosters` (see openspec/changes/shift-template-weekly-schedule-ia) - this
// route stays as a redirect for one release instead of a hard 404.
export default function SchedulesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/rosters");
  }, [router]);

  return null;
}
