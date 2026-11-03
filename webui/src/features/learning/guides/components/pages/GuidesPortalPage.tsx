"use client";

import type { CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { GuideTaskPage } from "./GuideTaskPage";
import { DailyPlanPage } from "./DailyPlanPage";
import { ProjectBlueprintPage } from "./ProjectBlueprintPage";
import { SuggestTopicsPage } from "./SuggestTopicsPage";
import { SuggestProjectsPage } from "./SuggestProjectsPage";

const TOOL_TABS = [
  "task",
  "daily-plan",
  "project-blueprint",
  "suggest-topics",
  "suggest-projects",
] as const;

type ToolTab = (typeof TOOL_TABS)[number];

function isToolTab(value: string | null): value is ToolTab {
  return value !== null && (TOOL_TABS as readonly string[]).includes(value);
}

const stickyTopStyle = {
  "--sticky-top": "calc(var(--navbar-height, 4rem) + 4.5rem)",
} as CSSProperties;

const LAYOUT_TOP_PADDING = "-mt-14";

export function GuidesPortalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = isToolTab(searchParams.get("tool"))
    ? searchParams.get("tool")!
    : "task";

  return (
    <div style={stickyTopStyle} className="mx-auto w-full max-w-7xl">
      <Tabs
        value={active}
        onValueChange={(value) =>
          router.replace(`/learning/guides?tool=${value}`, { scroll: false })
        }
        className="w-full"
      >
        <div
          className={cn(
            LAYOUT_TOP_PADDING,
            "sticky top-(--navbar-height) z-40 border-b border-border/60 bg-background/90 py-2 backdrop-blur"
          )}
        >
          <TabsList className="h-9 w-full flex-wrap max-sm:justify-start max-sm:overflow-x-auto">
            <TabsTrigger value="task" className="max-sm:h-8 max-sm:flex-none max-sm:px-3">
              Tasks
            </TabsTrigger>
            <TabsTrigger value="daily-plan" className="max-sm:h-8 max-sm:flex-none max-sm:px-3">
              Daily Plan
            </TabsTrigger>
            <TabsTrigger value="project-blueprint" className="max-sm:h-8 max-sm:flex-none max-sm:px-3">
              Blueprint
            </TabsTrigger>
            <TabsTrigger value="suggest-topics" className="max-sm:h-8 max-sm:flex-none max-sm:px-3">
              Topics
            </TabsTrigger>
            <TabsTrigger value="suggest-projects" className="max-sm:h-8 max-sm:flex-none max-sm:px-3">
              Projects
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="task" className="pt-4">
          <GuideTaskPage />
        </TabsContent>
        <TabsContent value="daily-plan" className="pt-4">
          <DailyPlanPage />
        </TabsContent>
        <TabsContent value="project-blueprint" className="pt-4">
          <ProjectBlueprintPage />
        </TabsContent>
        <TabsContent value="suggest-topics" className="pt-4">
          <SuggestTopicsPage />
        </TabsContent>
        <TabsContent value="suggest-projects" className="pt-4">
          <SuggestProjectsPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}