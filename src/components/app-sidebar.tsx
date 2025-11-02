"use client"

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { AppSwitcher } from "@/components/app-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { GENERAL_ROUTES, ADMIN_ROUTES, MANAGER_ROUTES } from "@/constants/routes";
import { AppsSwitcherRoutes } from "@/constants/appSwitcherUrls";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  apps: AppsSwitcherRoutes,
  manager: { title: "Quản lý", items: MANAGER_ROUTES },
  genenal: { title: "", items: GENERAL_ROUTES },
  admin: { title: "Quản trị", items: ADMIN_ROUTES },
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { role } = props;
  const routes = [data.genenal];
  if (role === 'admin') {
    routes.push(data.admin);
    routes.push(data.manager);
  } else if (role === 'manager') {
    routes.push(data.manager);
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppSwitcher apps={data.apps} />
      </SidebarHeader>
      <SidebarContent>
        {
          routes.map(group => (
            <NavMain key={group.title} title={group.title} items={group.items} />
          ))
        }
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
