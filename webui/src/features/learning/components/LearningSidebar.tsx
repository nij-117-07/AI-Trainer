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
import { explainerTools } from "@/features/learning/lib/explainer-tools";
import { guidesTools } from "@/features/learning/lib/guides-tools";
import { memoryHelperTools } from "@/features/learning/lib/memory-helper-tools";
import { motivationTools } from "@/features/learning/lib/motivation-tools";
import { projectsTools } from "@/features/learning/lib/projects-tools";
import { resourceSuggestorTools } from "@/features/learning/lib/resource-suggestor-tools";
import { skillArchitectTools } from "@/features/learning/lib/skill-architect-tools";
import { tutorChatTools } from "@/features/learning/lib/tutor-chat-tools";
import { tutorTools } from "@/features/learning/lib/tutor-tools";

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
              {explainerTools.map((tool) => {
                const isActive = explainerActive && activeExplainerTool === tool.id;
                return (
                  <SidebarMenuItem key={tool.id}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={tool.shortTitle}>
                      <Link href={tool.href}>
                        <tool.icon />
                        <span>{tool.shortTitle}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Guides</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/learning/guides"} tooltip="All guides">
                  <Link href="/learning/guides">
                    <LayoutGrid />
                    <span>All Guides</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {guidesTools.map((tool) => {
                const isActive = pathname === tool.href;
                return (
                  <SidebarMenuItem key={tool.id}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={tool.shortTitle}>
                      <Link href={tool.href}>
                        <tool.icon />
                        <span>{tool.shortTitle}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
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
                <SidebarMenuButton asChild isActive={pathname === "/learning/motivation"} tooltip="All tools">
                  <Link href="/learning/motivation">
                    <LayoutGrid />
                    <span>All Tools</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {motivationTools.map((tool) => (
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
                <SidebarMenuButton asChild isActive={pathname === "/learning/tutor"} tooltip="All tools">
                  <Link href="/learning/tutor">
                    <LayoutGrid />
                    <span>All Tools</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {tutorTools.map((tool) => (
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
          <SidebarGroupLabel>Tutor Chat</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tutorChatTools.map((tool) => (
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
