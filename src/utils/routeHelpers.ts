import { MAIN_ROUTES, SETTING_ROUTES, RouteConfig } from "@/constants/routes";

export function findRouteByPath(
  targetPath: string,
  routes: RouteConfig[] = [...MAIN_ROUTES, ...SETTING_ROUTES]
): RouteConfig | undefined {
  for (const route of routes) {
    if (route.path === targetPath) return route;
    if (route.children) {
      const found = findRouteByPath(targetPath, route.children);
      if (found) return found;
    }
  }
  return undefined;
}

// Dynamic path resolver: '/profile/[id]' => '/profile/123'
export function resolvePath(template: string, params: Record<string, string>) {
  return template.replace(/\[([^\]]+)]/g, (_, key) => params[key] || "");
}
