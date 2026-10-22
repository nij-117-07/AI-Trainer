// src/features/learning/projects/components/results/ProjectRecommenderResult.tsx
/**
 * Renders the Project Recommender output as a stack of project cards. Each
 * project is its own box (description always visible) with collapsible
 * dropdown sections for key concepts, prerequisites, deliverables, and stretch
 * goals. Top-level advice is shown as a callout.
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
  BookOpen,
  Clock,
  Flag,
  Lightbulb,
  ListChecks,
  Package,
} from "lucide-react";
import type { ProjectRecommendation, ProjectRecommenderResponse } from "../../types";

function ProjectCard({ project, index }: { project: ProjectRecommendation; index: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {index + 1}
          </span>
          {project.title}
          {typeof project.estimated_hours === "number" && (
            <Badge variant="secondary" className="ml-auto gap-1">
              <Clock className="h-3 w-3" />
              {project.estimated_hours}h
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {project.description.trim() && (
          <p className="mb-3 text-sm text-muted-foreground">{project.description.trim()}</p>
        )}

        <Accordion type="multiple" defaultValue={["key-concepts"]} className="w-full">
          {project.key_concepts.length > 0 && (
            <AccordionItem value="key-concepts">
              <AccordionTrigger className="text-base">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Key concepts
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
                  {project.key_concepts.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}

          {project.prerequisites.length > 0 && (
            <AccordionItem value="prerequisites">
              <AccordionTrigger className="text-base">
                <span className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-primary" />
                  Prerequisites
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
                  {project.prerequisites.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}

          {project.deliverables.length > 0 && (
            <AccordionItem value="deliverables">
              <AccordionTrigger className="text-base">
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Deliverables
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
                  {project.deliverables.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}

          {project.stretch_goals.length > 0 && (
            <AccordionItem value="stretch-goals">
              <AccordionTrigger className="text-base">
                <span className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-primary" />
                  Stretch goals
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
                  {project.stretch_goals.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
}

export function ProjectRecommenderResult({ result }: { result: ProjectRecommenderResponse }) {
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {result.projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No projects returned.</p>
        ) : (
          result.projects.map((project, index) => (
            <ProjectCard key={`${project.title}-${index}`} project={project} index={index} />
          ))
        )}
      </div>

      {result.advice?.trim() && (
        <ResultCallout icon={Lightbulb} title="Advice" tone="success">
          <MarkdownContent content={result.advice.trim()} />
        </ResultCallout>
      )}
    </div>
  );
}
