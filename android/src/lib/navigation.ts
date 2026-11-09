// src/lib/navigation.ts
/**
 * Back navigation that always has a destination. A page opened directly (a reload or a link) has
 * no history, so it falls back to the hub that owns the page, or the dashboard.
 */
import { useCallback } from "react";
import { usePathname, useRouter } from "expo-router";

const HUB_PATHS = ["/learning", "/practice", "/tools", "/language-learner"];

export function hubPathFor(pathname: string): string {
  const top = `/${pathname.split("/").filter(Boolean)[0] ?? ""}`;
  return HUB_PATHS.includes(top) ? top : "/";
}

export function useGoBack(): () => void {
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(hubPathFor(pathname) as never);
    }
  }, [router, pathname]);
}
