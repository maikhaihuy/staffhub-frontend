import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth'; // write logic to check auth
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
//   const session = await getSession();

//   if (!session) redirect('/login');

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
