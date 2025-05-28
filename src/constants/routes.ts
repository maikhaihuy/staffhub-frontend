import {
  Bike,
  CalendarClock,
  CalendarCog,
  CalendarRange,
  MapPinned,
  SquareTerminal,
  Store,
  Users,
} from "lucide-react"

// routes.ts
export interface RouteConfig {
  path: string;
  name: string;
  breadcrumb?: string;
  icon: React.ElementType;
  children?: RouteConfig[];
}

export const MainRoutes: RouteConfig[] = [
  {
    path: '/',
    name: 'Tổng quan',
    breadcrumb: 'Tổng quan',
    icon: SquareTerminal,
  },
  {
    path: '/shiftRequests',
    name: 'Ca đăng ký',
    breadcrumb: 'Ca đăng ký',
    icon: CalendarClock
  },
  {
    path: '/shiftSchedules',
    name: 'Ca làm việc',
    breadcrumb: 'Ca làm việc',
    icon: CalendarRange,
  },
  {
    path: '#',
    name: 'Xếp ca',
    breadcrumb: 'Xếp ca',
    icon: CalendarCog,
  },
  {
    path: "#",
    name: 'Ship',
    breadcrumb: 'Ship',
    icon: Bike,
  },
  {
    path: "#",
    name: "Điểm danh",
    breadcrumb: "Điểm danh",
    icon: MapPinned,
  },
];

export const SettingRoutes: RouteConfig[] = [
  {
    path: "/employees",
    name: "Nhân viên",
    breadcrumb: "Nhân viên",
    icon: Users,
  },
  {
    path: "/branches",
    name: "Chi nhánh",
    breadcrumb: "Chi nhánh",
    icon: Store,
  },
];