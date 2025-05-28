"use client"

import * as React from "react"
import {
  AudioWaveform,
  Bike,
  BookOpen,
  Bot,
  CalendarClock,
  CalendarCog,
  CalendarRange,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  MapPinned,
  PieChart,
  Settings2,
  SquareTerminal,
  Store,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { AppSwitcher } from "@/components/app-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { MainRoutes, SettingRoutes } from "@/constants/routes"
import { AppsSwitcherRoutes } from "@/constants/appSwitcherUrls"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  apps: AppsSwitcherRoutes,
  staff: MainRoutes,
  admin: SettingRoutes,
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppSwitcher apps={data.apps} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain key='staff' items={data.staff} />
        <NavMain key='admin' title='Quản trị' items={data.admin} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
