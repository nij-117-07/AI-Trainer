// src/features/practice/joke-coach/components/pages/JokeCoachPage.tsx
/**
 * Joke Coach page: six tabbed modes — Generate, Evaluate, Rewrite, Classify,
 * Practice, and Crowd Simulation. Each tab keeps its own persisted draft.
 */
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GenerateMode } from "../modes/GenerateMode";
import { EvaluateMode } from "../modes/EvaluateMode";
import { RewriteMode } from "../modes/RewriteMode";
import { ClassifyMode } from "../modes/ClassifyMode";
import { PracticeMode } from "../modes/PracticeMode";
import { CrowdMode } from "../modes/CrowdMode";

export function JokeCoachPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Joke Coach</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Generate original jokes, get structured feedback, sharpen them for a goal, classify how
          they work, drill with a coach, and simulate the crowd before you step on stage.
        </p>
      </header>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="w-full flex-wrap">
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="evaluate">Evaluate</TabsTrigger>
          <TabsTrigger value="rewrite">Rewrite</TabsTrigger>
          <TabsTrigger value="classify">Classify</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="crowd">Crowd Sim</TabsTrigger>
        </TabsList>
        <TabsContent value="generate" className="pt-4">
          <GenerateMode />
        </TabsContent>
        <TabsContent value="evaluate" className="pt-4">
          <EvaluateMode />
        </TabsContent>
        <TabsContent value="rewrite" className="pt-4">
          <RewriteMode />
        </TabsContent>
        <TabsContent value="classify" className="pt-4">
          <ClassifyMode />
        </TabsContent>
        <TabsContent value="practice" className="pt-4">
          <PracticeMode />
        </TabsContent>
        <TabsContent value="crowd" className="pt-4">
          <CrowdMode />
        </TabsContent>
      </Tabs>
    </div>
  );
}
