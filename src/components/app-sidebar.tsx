"use client"
import * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { AppSwitcher } from "@/components/app-switcher";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { GENERAL_ROUTES, ADMIN_ROUTES, MANAGER_ROUTES, RouteConfig } from "@/constants/routes";
import { AppsSwitcherRoutes } from "@/constants/appSwitcherUrls";
import { useAbility } from "@/features/auth/hooks/useAbility";

const data = {
  user: { name: "shadcn", email: "m@example.com", avatar: "/avatars/shadcn.jpg" },
  apps: AppsSwitcherRoutes,
  manager: { title: "Quản lý", items: MANAGER_ROUTES },
  genenal: { title: "", items: GENERAL_ROUTES },
  admin: { title: "Quản trị", items: ADMIN_ROUTES },
}

/**
 * A route with no `requiredPermission` is always shown (matches
 * GENERAL_ROUTES today). A route that declares one is shown only if the
 * current admin's resolved abilities grant it - replacing the previous
 * hardcoded role="admin" prop, which was dead code for real users.
 */
function filterByAbility(
  items: RouteConfig[],
  // eslint-disable-next-line no-unused-vars
  can: (action: string, subject: string) => boolean
): RouteConfig[] {
  return items.filter(
    (item) => !item.requiredPermission || can(item.requiredPermission.action, item.requiredPermission.subject)
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { ability, isLoading } = useAbility();

  const routes = isLoading
    ? [data.genenal]
    : [
        data.genenal,
        { title: data.manager.title, items: filterByAbility(data.manager.items, ability.can.bind(ability)) },
        { title: data.admin.title, items: filterByAbility(data.admin.items, ability.can.bind(ability)) },
      ].filter((group) => group.items.length > 0);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader><AppSwitcher apps={data.apps} /></SidebarHeader>
      <SidebarContent>
        {routes.map(group => <NavMain key={group.title} title={group.title} items={group.items} />)}
      </SidebarContent>
      <SidebarFooter><NavUser user={data.user} /></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
