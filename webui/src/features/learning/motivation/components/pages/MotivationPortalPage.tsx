"use client";

import type { CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { MotivationQuotePage } from "./MotivationQuotePage";
import { ReflectionPage } from "./ReflectionPage";

const TOOL_TABS = ["quote", "reflect"] as const;
type ToolTab = (typeof TOOL_TABS)[number];

function isToolTab(value: string | null): value is ToolTab {
  return value !== null && (TOOL_TABS as readonly string[]).includes(value);
}

const stickyTopStyle = {
  "--sticky-top": "calc(var(--navbar-height, 4rem) + 4.5rem)",
} as CSSProperties;

const LAYOUT_TOP_PADDING = "-mt-14";

export function MotivationPortalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = isToolTab(searchParams.get("tool"))
    ? searchParams.get("tool")!
    : "quote";

  return (
    <div style={stickyTopStyle} className="mx-auto w-full max-w-7xl">
      <Tabs
        value={active}
        onValueChange={(value) =>
          router.replace(`/learning/motivation?tool=${value}`, { scroll: false })
        }
        className="w-full"
      >
        <div
          className={cn(
            LAYOUT_TOP_PADDING,
            "sticky top-(--navbar-height) z-40 border-b border-border/60 bg-background/90 py-2 backdrop-blur"
          )}
        >
          <TabsList className="h-9 w-full max-sm:justify-start max-sm:overflow-x-auto">
            <TabsTrigger value="quote" className="max-sm:h-8 max-sm:flex-none max-sm:px-3">
              Quote
            </TabsTrigger>
            <TabsTrigger value="reflect" className="max-sm:h-8 max-sm:flex-none max-sm:px-3">
              Reflect
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="quote" className="pt-4">
          <MotivationQuotePage />
        </TabsContent>
        <TabsContent value="reflect" className="pt-4">
          <ReflectionPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}