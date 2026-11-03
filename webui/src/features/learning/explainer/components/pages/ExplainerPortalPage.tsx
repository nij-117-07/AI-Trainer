// src/features/learning/explainer/components/pages/ExplainerPortalPage.tsx
/**
 * Single tabbed workspace for every Explainer tool (like the Testing Portal).
 * The active tool is kept in sync with the `?tool=` query param so sidebar
 * links and bookmarks deep-link straight to a tab. Each tab keeps its own
 * persisted draft and result.
 */
"use client";

import type { CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { AtozPointerToolPage } from "./AtozPointerToolPage";
import { AtozToolPage } from "./AtozToolPage";
import { CurriculumToolPage } from "./CurriculumToolPage";
import { ExplainToolPage } from "./ExplainToolPage";
import { FeynmanToolPage } from "./FeynmanToolPage";
import { OrchestrateToolPage } from "./OrchestrateToolPage";
import { SocraticToolPage } from "./SocraticToolPage";

const TOOL_TABS = [
  "explain",
  "atoz",
  "atozpointer",
  "feynman",
  "orchestrate",
  "socratic",
  "curriculum",
] as const;

type ToolTab = (typeof TOOL_TABS)[number];

function isToolTab(value: string | null): value is ToolTab {
  return value !== null && (TOOL_TABS as readonly string[]).includes(value);
}

const stickyTopStyle = {
  "--sticky-top": "calc(var(--navbar-height, 4rem) + 4.5rem)",
} as CSSProperties;

const LAYOUT_TOP_PADDING = "-mt-14";

export function ExplainerPortalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = isToolTab(searchParams.get("tool")) ? searchParams.get("tool")! : "explain";

  return (
    <div style={stickyTopStyle} className="mx-auto w-full max-w-7xl">
      <Tabs
        value={active}
        onValueChange={(value) =>
          router.replace(`/learning/explainer?tool=${value}`, { scroll: false })
        }
        className="w-full"
      >
        <div className={cn(LAYOUT_TOP_PADDING, "sticky top-(--navbar-height) z-40 border-b border-border/60 bg-background/90 py-2 backdrop-blur")}>
          <TabsList className="h-9 w-full flex-wrap max-sm:justify-start max-sm:overflow-x-auto">
            <TabsTrigger value="explain" className="max-sm:h-8 max-sm:flex-none max-sm:px-3">
              Quick Explain
            </TabsTrigger>
            <TabsTrigger value="atoz" className="max-sm:h-8 max-sm:flex-none max-sm:px-3">
              A-to-Z
            </TabsTrigger>
            <TabsTrigger value="atozpointer" className="max-sm:h-8 max-sm:flex-none max-sm:px-3">
              Roadmap
            </TabsTrigger>
            <TabsTrigger value="feynman" className="max-sm:h-8 max-sm:flex-none max-sm:px-3">
              Feynman
            </TabsTrigger>
            <TabsTrigger value="orchestrate" className="max-sm:h-8 max-sm:flex-none max-sm:px-3">
              Journey
            </TabsTrigger>
            <TabsTrigger value="socratic" className="max-sm:h-8 max-sm:flex-none max-sm:px-3">
              Socratic
            </TabsTrigger>
            <TabsTrigger value="curriculum" className="max-sm:h-8 max-sm:flex-none max-sm:px-3">
              Curriculum
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="explain" className="pt-4">
          <ExplainToolPage />
        </TabsContent>
        <TabsContent value="atoz" className="pt-4">
          <AtozToolPage />
        </TabsContent>
        <TabsContent value="atozpointer" className="pt-4">
          <AtozPointerToolPage />
        </TabsContent>
        <TabsContent value="feynman" className="pt-4">
          <FeynmanToolPage />
        </TabsContent>
        <TabsContent value="orchestrate" className="pt-4">
          <OrchestrateToolPage />
        </TabsContent>
        <TabsContent value="socratic" className="pt-4">
          <SocraticToolPage />
        </TabsContent>
        <TabsContent value="curriculum" className="pt-4">
          <CurriculumToolPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
