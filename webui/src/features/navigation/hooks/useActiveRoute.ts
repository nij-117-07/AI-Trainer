// src/features/navigation/hooks/useActiveRoute.ts
/**
 * Hook to determine if a given route is currently active.
 * Compares against the current pathname for highlighting navigation items.
 */
"use client";

import { usePathname } from "next/navigation";

export function useActiveRoute() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return { pathname, isActive };
}
