// src/features/learning/resource-suggestor/components/results/ResourceSuggestorResult.tsx
/**
 * Renders the Resource Suggestor output: a learning path summary callout,
 * a stack of resource cards (each with collapsible details), and a next-steps
 * callout at the bottom.
 */
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { ResultCallout } from "@/features/learning/explainer/components/ResultCallout";
import {
  BookMarked,
  Clock,
  ExternalLink,
  Lightbulb,
  Route,
  Target,
  User,
} from "lucide-react";
import type { ResourceItem, ResourceSuggestorResponse } from "../../types";

function ResourceCard({ resource, index }: { resource: ResourceItem; index: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {index + 1}
          </span>
          <span className="min-w-0 flex-1">{resource.title}</span>
          <Badge variant="secondary" className="ml-auto shrink-0 capitalize">
            {resource.type.replace(/_/g, " ")}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {resource.author_or_creator}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {resource.estimated_time}
          </span>
          <Badge variant="outline" className="capitalize">
            {resource.difficulty_level}
          </Badge>
        </div>

        {resource.description.trim() && (
          <p className="text-sm text-muted-foreground">{resource.description.trim()}</p>
        )}

        <Accordion type="single" className="w-full">
          <AccordionItem value="details">
            <AccordionTrigger className="text-sm">
              <span className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Why this is recommended
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">{resource.why_recommended}</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="prerequisites">
            <AccordionTrigger className="text-sm">
              <span className="flex items-center gap-2">
                <BookMarked className="h-4 w-4 text-primary" />
                Prerequisite knowledge
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">{resource.prerequisite_knowledge}</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="access">
            <AccordionTrigger className="text-sm">
              <span className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-primary" />
                How to access
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">{resource.access_info}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

export function ResourceSuggestorResult({ result }: { result: ResourceSuggestorResponse }) {
  return (
    <div className="space-y-4">
      {result.learning_path_summary.trim() && (
        <ResultCallout icon={Route} title="Learning Path Summary" tone="info">
          <MarkdownContent content={result.learning_path_summary.trim()} />
        </ResultCallout>
      )}

      <div className="space-y-4">
        {result.recommended_resources.length === 0 ? (
          <p className="text-sm text-muted-foreground">No resources returned.</p>
        ) : (
          result.recommended_resources.map((resource, index) => (
            <ResourceCard
              key={`${resource.title}-${index}`}
              resource={resource}
              index={index}
            />
          ))
        )}
      </div>

      {result.next_steps.trim() && (
        <ResultCallout icon={Lightbulb} title="Next Steps" tone="success">
          <MarkdownContent content={result.next_steps.trim()} />
        </ResultCallout>
      )}
    </div>
  );
}
