// src/features/linguistic/components/LinguisticSidebar.tsx
/**
 * Left navigation for the Linguistic area. Lists every language tool from the
 * shared registries and highlights the active route. Collapses to an icon rail
 * on desktop and a drawer on mobile via the shadcn Sidebar primitives.
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
import { Languages, LayoutGrid } from "lucide-react";
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { idiomsTools } from "@/features/linguistic/lib/idioms-tools";
import { wordOfTheDayTools } from "@/features/linguistic/lib/word-of-the-day-tools";
import { translatorTools } from "@/features/linguistic/lib/translator-tools";
import { simulatorTools } from "@/features/linguistic/lib/simulator-tools";
import { sentenceOfTheDayTools } from "@/features/linguistic/lib/sentence-of-the-day-tools";
import { rewriterTools } from "@/features/linguistic/lib/rewriter-tools";
import { lessonTools } from "@/features/linguistic/lib/lesson-tools";
import { poetEngineTools } from "@/features/linguistic/lib/poet-engine-tools";
import { languageTesterTools } from "@/features/linguistic/lib/language-tester-tools";
import { roleplayTools } from "@/features/linguistic/lib/roleplay-tools";

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

function ToolGroupWithAll({
  label,
  allHref,
  tools,
  pathname,
}: {
  label: string;
  allHref: string;
  tools: LearningTool[];
  pathname: string;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === allHref} tooltip="All tools">
              <Link href={allHref}>
                <LayoutGrid />
                <span>All Tools</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
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

export function LinguisticSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Languages className="h-5 w-5 shrink-0 text-primary" />
            <span className="group-data-[collapsible=icon]:hidden truncate text-sm font-semibold">
              Linguistic Hub
            </span>
          </div>
          <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <ToolGroup label="Idioms" tools={idiomsTools} pathname={pathname} />
        <ToolGroup label="Word of the Day" tools={wordOfTheDayTools} pathname={pathname} />
        <ToolGroup label="Sentence of the Day" tools={sentenceOfTheDayTools} pathname={pathname} />
        <ToolGroup label="Translator" tools={translatorTools} pathname={pathname} />
        <ToolGroup label="Rewriter" tools={rewriterTools} pathname={pathname} />
        <ToolGroup label="Lesson" tools={lessonTools} pathname={pathname} />
        <ToolGroup label="Poet Engine" tools={poetEngineTools} pathname={pathname} />
        <ToolGroupWithAll
          label="Language Tester"
          allHref="/linguistic/language-tester"
          tools={languageTesterTools}
          pathname={pathname}
        />
        <ToolGroupWithAll
          label="Simulator"
          allHref="/linguistic/simulator"
          tools={simulatorTools}
          pathname={pathname}
        />
        <ToolGroupWithAll
          label="Roleplay"
          allHref="/linguistic/roleplay"
          tools={roleplayTools}
          pathname={pathname}
        />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
