// src/features/learning/explainer/components/results/AtozPointerResult.tsx
/**
 * Renders the Knowledge Roadmap output: a summary, an expandable concept
 * roadmap, and a practical takeaway callout.
 */
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { ResultCallout } from "../ResultCallout";
import { BookOpen, Lightbulb, ListTree } from "lucide-react";
import type { AtoZResponse } from "../../types";

export function AtozPointerResult({ result }: { result: AtoZResponse }) {
  return (
    <div className="space-y-4">
      <ResultCallout icon={BookOpen} title="Summary" tone="info">
        <MarkdownContent content={result.summary} />
      </ResultCallout>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListTree className="h-4 w-4 text-primary" />
            Knowledge Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          {result.knowledge_roadmap.length === 0 ? (
            <p className="text-sm text-muted-foreground">No roadmap concepts returned.</p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {result.knowledge_roadmap.map((item, index) => (
                <AccordionItem key={`${item.concept}-${index}`} value={`concept-${index}`}>
                  <AccordionTrigger className="text-base">
                    <span className="flex items-center gap-2">
                      <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {index + 1}
                      </span>
                      {item.concept}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pl-7 text-sm text-muted-foreground">
                    <MarkdownContent content={item.explanation} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      <ResultCallout icon={Lightbulb} title="Practical Takeaway" tone="success">
        <MarkdownContent content={result.practical_takeaway} />
      </ResultCallout>
    </div>
  );
}
