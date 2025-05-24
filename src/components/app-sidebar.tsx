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
import { NavSetting } from "@/components/nav-setting"
import { NavUser } from "@/components/nav-user"
import { AppSwitcher } from "@/components/app-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  apps: [
    {
      name: "Employee Management App",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Inventory Managenement App",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Selas Management App",
      logo: Command,
      plan: "Free",
    },
  ],
  staff: [
    {
      title: "Tổng quan",
      url: "#",
      icon: SquareTerminal,
    },
    {
      title: "Ca đăng ký",
      url: "#",
      icon: CalendarClock
    },
    {
      title: "Ca làm việc",
      url: "#",
      icon: CalendarRange,
    },
    {
      title: "Xếp ca",
      url: "#",
      icon: CalendarCog,
    },
    {
      title: "Ship",
      url: "#",
      icon: Bike,
    },
    {
      title: "Điểm danh",
      url: "#",
      icon: MapPinned,
    },
  ],
  admin: [
    {
      title: "Nhân viên",
      url: "#",
      icon: Users,
    },
    {
      title: "Chi nhánh",
      url: "#",
      icon: Store,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppSwitcher teams={data.apps} />
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
