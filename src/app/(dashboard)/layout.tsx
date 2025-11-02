import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import type { ReactNode } from 'react';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
//   const session = await getSession();

//   if (!session) redirect('/login');

  return (
    <SidebarProvider>
      <AppSidebar role="admin" />
      <SidebarInset>
        <main className="grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-4 md:gap-4 bg-muted/40">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
