// src/features/practice/testing-portal/components/pages/TestingPortalPage.tsx
/**
 * Testing Portal page: five tabbed generators — MCQs, Theoretical questions,
 * Expert answers, MCQ solving, and a custom Performance Grader. Each tab keeps
 * its own persisted draft and result. The tab selector is pinned flush below
 * the sticky navbar from page load (its initial offset cancels the layout
 * paddings above it, so it "fixes" without ever scrolling away).
 */
"use client";

import type { CSSProperties } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { GraderPage } from "@/features/practice/grader/components/pages/GraderPage";
import { McqForm } from "../forms/McqForm";
import { TheoreticalForm } from "../forms/TheoreticalForm";
import { AnswerForm } from "../forms/AnswerForm";
import { SolverForm } from "../forms/SolverForm";

/** Offset the page's sticky columns (form sidebar) below the fixed tab bar. */
const stickyTopStyle = {
  "--sticky-top": "calc(var(--navbar-height, 4rem) + 4.5rem)",
} as CSSProperties;

/**
 * Top padding above the page content (authenticated layout `py-8` + practice
 * layout `p-6`). The tab bar cancels it with a matching negative margin so
 * it starts exactly at its sticky position and never moves while scrolling.
 */
const LAYOUT_TOP_PADDING = "-mt-14";

export function TestingPortalPage() {
  return (
    <div style={stickyTopStyle} className="mx-auto w-full max-w-7xl">
      <Tabs defaultValue="mcq" className="w-full">
        <div className={cn(LAYOUT_TOP_PADDING, "sticky top-(--navbar-height) z-40 border-b border-border/60 bg-background/90 py-2 backdrop-blur")}>
          <TabsList className="h-9 w-full max-sm:justify-start max-sm:overflow-x-auto">
            <TabsTrigger value="mcq" className="max-sm:h-8 max-sm:flex-none max-sm:px-3">
              MCQs
            </TabsTrigger>
            <TabsTrigger value="theoretical" className="max-sm:h-8 max-sm:flex-none max-sm:px-3">
              Theoretical
            </TabsTrigger>
            <TabsTrigger value="answer" className="max-sm:h-8 max-sm:flex-none max-sm:px-3">
              Expert Answer
            </TabsTrigger>
            <TabsTrigger value="solver" className="max-sm:h-8 max-sm:flex-none max-sm:px-3">
              Solve an MCQ
            </TabsTrigger>
            <TabsTrigger value="grader" className="max-sm:h-8 max-sm:flex-none max-sm:px-3">
              Grader
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="mcq" className="pt-4">
          <McqForm />
        </TabsContent>
        <TabsContent value="theoretical" className="pt-4">
          <TheoreticalForm />
        </TabsContent>
        <TabsContent value="answer" className="pt-4">
          <AnswerForm />
        </TabsContent>
        <TabsContent value="solver" className="pt-4">
          <SolverForm />
        </TabsContent>
        <TabsContent value="grader" className="pt-4">
          <GraderPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
