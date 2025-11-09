'use client';
import { usePathname } from 'next/navigation';
import { findRouteByPath } from '@/lib/utils/routeHelpers';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from './ui/breadcrumb';

export default function AppBreadcrumb() {
  const pathname = usePathname();
  if (!pathname) {
    return null; // No pathname available
  }
  const segments = pathname.split('/').filter(Boolean);
  const crumbs = [];

  let currentPath = '';

  for (const segment of segments) {
    currentPath += `/${segment}`;
    const match = findRouteByPath(currentPath);
    if (match) {
      crumbs.push({
        name: match.breadcrumb || match.name,
        path: currentPath,
      });
    }
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
      {crumbs.map((crumb, idx) => (
        <span key={idx}>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href={crumb.path}>
              {crumb.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          { idx < crumbs.length - 1 && (<BreadcrumbSeparator className="hidden md:block" />) }
        </span>
      ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
