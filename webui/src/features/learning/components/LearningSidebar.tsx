// src/features/learning/components/LearningSidebar.tsx
/**
 * Left navigation for the Learning area. Lists every Learning section as a
 * single flat item and highlights the active route. Collapses to an icon rail
 * on desktop and a drawer on mobile via the shadcn Sidebar primitives.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { GraduationCap, LayoutGrid, MapPinned } from "lucide-react";
import { conceptualBridgeTools } from "@/features/learning/lib/conceptual-bridge-tools";
import { memoryHelperTools } from "@/features/learning/lib/memory-helper-tools";
import { projectsTools } from "@/features/learning/lib/projects-tools";
import { resourceSuggestorTools } from "@/features/learning/lib/resource-suggestor-tools";
import { skillArchitectTools } from "@/features/learning/lib/skill-architect-tools";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: "Explainer", href: "/learning/explainer", icon: LayoutGrid },
  { label: "Guides", href: "/learning/guides", icon: LayoutGrid },
  { label: "Roadmap", href: "/learning/roadmap", icon: MapPinned },
  ...memoryHelperTools.map((tool) => ({ label: tool.shortTitle, href: tool.href, icon: tool.icon })),
  { label: "Motivation", href: "/learning/motivation", icon: LayoutGrid },
  ...projectsTools.map((tool) => ({ label: tool.shortTitle, href: tool.href, icon: tool.icon })),
  ...resourceSuggestorTools.map((tool) => ({ label: tool.shortTitle, href: tool.href, icon: tool.icon })),
  ...skillArchitectTools.map((tool) => ({ label: tool.shortTitle, href: tool.href, icon: tool.icon })),
  { label: "Tutor", href: "/learning/tutor", icon: LayoutGrid },
  ...conceptualBridgeTools.map((tool) => ({ label: tool.shortTitle, href: tool.href, icon: tool.icon })),
];

function isRouteActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function LearningSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <GraduationCap className="h-5 w-5 shrink-0 text-primary" />
            <span className="group-data-[collapsible=icon]:hidden truncate text-sm font-semibold">
              Learning Hub
            </span>
          </div>
          <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isRouteActive(pathname, item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
