"use client";

import type { CSSProperties } from "react";
import type { TutorChatSessionSummary } from "@/features/learning/tutor-chat/types";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { TutorPage } from "./TutorPage";
import { PromptManagerPage } from "./PromptManagerPage";
import { TutorChatPage } from "@/features/learning/tutor-chat/components/pages/TutorChatPage";

const TOOL_TABS = ["adaptive", "prompts", "chat"] as const;
type ToolTab = (typeof TOOL_TABS)[number];

function isToolTab(value: string | null): value is ToolTab {
  return value !== null && (TOOL_TABS as readonly string[]).includes(value);
}

const stickyTopStyle = {
  "--sticky-top": "calc(var(--navbar-height, 4rem) + 4.5rem)",
} as CSSProperties;

const LAYOUT_TOP_PADDING = "-mt-14";

interface TutorPortalPageProps {
  initialSessions: TutorChatSessionSummary[];
}

export function TutorPortalPage({ initialSessions }: TutorPortalPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = isToolTab(searchParams.get("tool"))
    ? searchParams.get("tool")!
    : "adaptive";

  return (
    <div style={stickyTopStyle} className="mx-auto w-full max-w-7xl">
      <Tabs
        value={active}
        onValueChange={(value) =>
          router.replace(`/learning/tutor?tool=${value}`, { scroll: false })
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
            <TabsTrigger value="adaptive" className="max-sm:h-8 max-sm:flex-none max-sm:px-3">
              Adaptive Tutor
            </TabsTrigger>
            <TabsTrigger value="prompts" className="max-sm:h-8 max-sm:flex-none max-sm:px-3">
              Prompt Templates
            </TabsTrigger>
            <TabsTrigger value="chat" className="max-sm:h-8 max-sm:flex-none max-sm:px-3">
              Tutor Chat
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="adaptive" className="pt-4">
          <TutorPage />
        </TabsContent>
        <TabsContent value="prompts" className="pt-4">
          <PromptManagerPage />
        </TabsContent>
        <TabsContent value="chat" className="pt-4">
          <TutorChatPage initialSessions={initialSessions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}