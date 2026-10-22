// src/features/tools/rss/components/RssTabs.tsx
/**
 * Route-based tab bar switching between the RSS Viewer and Manager pages.
 * Highlights the active route using usePathname; used inside the shared
 * RSS layout so both pages offer one-click navigation between them.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutGrid, Settings2 } from "lucide-react";

const TABS = [
  { href: "/tools/rss/viewer", label: "Viewer", icon: LayoutGrid },
  { href: "/tools/rss/manager", label: "Manager", icon: Settings2 },
] as const;

export function RssTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="RSS feed views"
      className="inline-flex items-center gap-1 rounded-xl border bg-muted/50 p-1"
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
