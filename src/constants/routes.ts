import {
  Bike,
  CalendarClock,
  CalendarCog,
  CalendarCheck,
  CalendarRange,
  MapPinned,
  SquareTerminal,
  Store,
  Users,
  CalendarPlus2,
} from 'lucide-react';
import React from 'react';

// routes.ts
export interface RouteConfig {
  path: string;
  name: string;
  breadcrumb?: string;
  icon: React.ElementType;
  children?: RouteConfig[];
}

export const GENERAL_ROUTES: RouteConfig[] = [
  {
    path: '/',
    name: 'Tổng quan',
    breadcrumb: 'Tổng quan',
    icon: SquareTerminal,
  },
  {
    path: '/my-availabilities',
    name: 'Đăng ký ca',
    breadcrumb: 'Đăng ký ca',
    icon: CalendarPlus2
  },
  {
    path: '/my-calendars',
    name: 'Xem lịch ca',
    breadcrumb: 'Xem lịch ca',
    icon: CalendarCheck,
  },
  {
    path: '/attendanceTracking',
    name: 'Điểm danh',
    breadcrumb: 'Điểm danh',
    icon: MapPinned,
  },
];

export const MANAGER_ROUTES: RouteConfig[] = [
  {
    path: '/availabilities',
    name: 'Ca đăng ký',
    breadcrumb: 'Ca đăng ký',
    icon: CalendarClock
  },
  {
    path: '/schedules',
    name: 'Xếp ca',
    breadcrumb: 'Xếp ca',
    icon: CalendarCog,
  },
  {
    path: '/rosters',
    name: 'Lịch làm việc',
    breadcrumb: 'Lịch làm việc',
    icon: CalendarRange,
  },
  {
    path: '/shipLogs',
    name: 'Ship',
    breadcrumb: 'Ship',
    icon: Bike,
  },
];

export const ADMIN_ROUTES: RouteConfig[] = [
  {
    path: '/employees',
    name: 'Nhân viên',
    breadcrumb: 'Nhân viên',
    icon: Users,
  },
  {
    path: '/branches',
    name: 'Chi nhánh',
    breadcrumb: 'Chi nhánh',
    icon: Store,
  },
];
