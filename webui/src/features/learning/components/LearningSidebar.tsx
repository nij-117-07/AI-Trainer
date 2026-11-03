// src/features/learning/components/LearningSidebar.tsx
/**
 * Left navigation for the Learning area. Lists every Explainer tool from the
 * shared registry and highlights the active route. Collapses to an icon rail
 * on desktop and a drawer on mobile via the shadcn Sidebar primitives.
 */
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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



export function LearningSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeExplainerTool = searchParams.get("tool");
  const explainerActive = pathname === "/learning/explainer";

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
          <SidebarGroupLabel>Explainer</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={explainerActive && !activeExplainerTool}
                  tooltip="All tools"
                >
                  <Link href="/learning/explainer">
                    <LayoutGrid />
                    <span>All Tools</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* Explainer sub-tools are selected via the in-page horizontal tab bar. */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Guides</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/learning/guides" || pathname.startsWith("/learning/guides/")}
                  tooltip="All guides"
                >
                  <Link href="/learning/guides">
                    <LayoutGrid />
                    <span>All Guides</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Roadmap</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/learning/roadmap" || pathname.startsWith("/learning/roadmap/")}
                  tooltip="Roadmap Planner"
                >
                  <Link href="/learning/roadmap">
                    <MapPinned />
                    <span>Roadmap Planner</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Memory</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {memoryHelperTools.map((tool) => (
                <SidebarMenuItem key={tool.id}>
                  <SidebarMenuButton asChild isActive={pathname === tool.href} tooltip={tool.shortTitle}>
                    <Link href={tool.href}>
                      <tool.icon />
                      <span>{tool.shortTitle}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Motivation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/learning/motivation" || pathname.startsWith("/learning/motivation/")}
                  tooltip="All motivation"
                >
                  <Link href="/learning/motivation">
                    <LayoutGrid />
                    <span>All Motivation</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projectsTools.map((tool) => (
                <SidebarMenuItem key={tool.id}>
                  <SidebarMenuButton asChild isActive={pathname === tool.href} tooltip={tool.shortTitle}>
                    <Link href={tool.href}>
                      <tool.icon />
                      <span>{tool.shortTitle}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourceSuggestorTools.map((tool) => (
                <SidebarMenuItem key={tool.id}>
                  <SidebarMenuButton asChild isActive={pathname === tool.href} tooltip={tool.shortTitle}>
                    <Link href={tool.href}>
                      <tool.icon />
                      <span>{tool.shortTitle}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Skill Architect</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {skillArchitectTools.map((tool) => (
                <SidebarMenuItem key={tool.id}>
                  <SidebarMenuButton asChild isActive={pathname === tool.href} tooltip={tool.shortTitle}>
                    <Link href={tool.href}>
                      <tool.icon />
                      <span>{tool.shortTitle}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Tutor</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/learning/tutor" || pathname.startsWith("/learning/tutor/")}
                  tooltip="All tutor"
                >
                  <Link href="/learning/tutor">
                    <LayoutGrid />
                    <span>All Tutor</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Conceptual Bridge</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {conceptualBridgeTools.map((tool) => (
                <SidebarMenuItem key={tool.id}>
                  <SidebarMenuButton asChild isActive={pathname === tool.href} tooltip={tool.shortTitle}>
                    <Link href={tool.href}>
                      <tool.icon />
                      <span>{tool.shortTitle}</span>
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
