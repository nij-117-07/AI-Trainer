// src/features/learning/explainer/components/pages/ExplainerPortalPage.tsx
/**
 * Single tabbed workspace for every Explainer tool (like the Testing Portal).
 * The active tool is kept in sync with the `?tool=` query param so sidebar
 * links and bookmarks deep-link straight to a tab. Each tab keeps its own
 * persisted draft and result.
 */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export function ExplainerPortalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = isToolTab(searchParams.get("tool")) ? searchParams.get("tool")! : "explain";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <Tabs
        value={active}
        onValueChange={(value) =>
          router.replace(`/learning/explainer?tool=${value}`, { scroll: false })
        }
        className="w-full"
      >
        <TabsList className="w-full flex-wrap">
          <TabsTrigger value="explain">Quick Explain</TabsTrigger>
          <TabsTrigger value="atoz">A-to-Z</TabsTrigger>
          <TabsTrigger value="atozpointer">Roadmap</TabsTrigger>
          <TabsTrigger value="feynman">Feynman</TabsTrigger>
          <TabsTrigger value="orchestrate">Journey</TabsTrigger>
          <TabsTrigger value="socratic">Socratic</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
        </TabsList>
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
