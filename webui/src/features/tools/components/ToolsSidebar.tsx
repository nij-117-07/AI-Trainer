// src/features/tools/components/ToolsSidebar.tsx
/**
 * Left navigation for the Tools area. Lists every tool from the shared
 * registries and highlights the active route. Collapses to an icon rail on
 * desktop and a drawer on mobile via the shadcn Sidebar primitives.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { Wrench } from "lucide-react";
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { visionConverterTools } from "@/features/tools/lib/vision-converter-tools";
import { ingredientsTools } from "@/features/tools/lib/ingredients-tools";
import { socialPostsTools } from "@/features/tools/lib/social-posts-tools";
import { promptGeneratorTools } from "@/features/tools/lib/prompt-generator-tools";
import { flexibleWriterTools } from "@/features/tools/lib/flexible-writer-tools";
import { diagramTools } from "@/features/tools/lib/diagram-tools";
import { creativeAssetsTools } from "@/features/tools/lib/creative-assets-tools";
import { chartsTools } from "@/features/tools/lib/charts-tools";
import { rssTools } from "@/features/tools/rss/lib/rss-tools";
import { aiDetectorTools } from "@/features/tools/lib/ai-detector-tools";

function ToolGroup({ label, tools, pathname }: { label: string; tools: LearningTool[]; pathname: string }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {tools.map((tool) => (
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
  );
}

export function ToolsSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Wrench className="h-5 w-5 shrink-0 text-primary" />
            <span className="group-data-[collapsible=icon]:hidden truncate text-sm font-semibold">
              Tools Hub
            </span>
          </div>
          <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <ToolGroup label="Visual" tools={[...visionConverterTools, ...diagramTools, ...chartsTools]} pathname={pathname} />
        <ToolGroup label="Content" tools={[...socialPostsTools, ...creativeAssetsTools, ...flexibleWriterTools, ...promptGeneratorTools, ...aiDetectorTools]} pathname={pathname} />
        <ToolGroup label="Reading" tools={rssTools} pathname={pathname} />
        <ToolGroup label="Lifestyle" tools={ingredientsTools} pathname={pathname} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
