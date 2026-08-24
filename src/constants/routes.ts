import {
  Bike,
  CalendarClock,
  CalendarCheck,
  CalendarRange,
  Clock,
  MapPinned,
  SquareTerminal,
  Store,
  Users,
  UserCog,
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
  {
    path: '/users',
    name: 'Người dùng',
    breadcrumb: 'Người dùng',
    icon: UserCog,
  },
  {
    path: '/shifts',
    name: 'Loại ca làm việc',
    breadcrumb: 'Loại ca làm việc',
    icon: Clock,
  },
];
