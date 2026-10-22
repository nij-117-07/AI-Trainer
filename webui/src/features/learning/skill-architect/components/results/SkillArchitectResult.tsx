// src/features/learning/skill-architect/components/results/SkillArchitectResult.tsx
/**
 * Renders the Skill Architect output as a stack of level cards. Each level is
 * its own box (root skills, how it works, proof of mastery, unlock condition)
 * with collapsible dropdown sections. Core philosophy, bottleneck, and
 * navigation are shown as callouts.
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
import { ResultCallout } from "@/features/learning/explainer/components/ResultCallout";
import {
  BookOpen,
  Compass,
  GitBranch,
  Lightbulb,
  ListChecks,
  Unlock,
} from "lucide-react";
import type { SkillArchitectResponse, SkillTreeLevel } from "../../types";

function LevelCard({ level, index }: { level: SkillTreeLevel; index: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {index + 1}
          </span>
          {level.level_name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={["root-skills"]} className="w-full">
          {level.root_skills.length > 0 && (
            <AccordionItem value="root-skills">
              <AccordionTrigger className="text-base">
                <span className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-primary" />
                  Root skills
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
                  {level.root_skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}

          {level.how_it_works.trim() && (
            <AccordionItem value="how-it-works">
              <AccordionTrigger className="text-base">
                <span className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  How it works
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <MarkdownContent content={level.how_it_works.trim()} />
              </AccordionContent>
            </AccordionItem>
          )}

          {level.proof_of_mastery.trim() && (
            <AccordionItem value="proof-of-mastery">
              <AccordionTrigger className="text-base">
                <span className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-primary" />
                  Proof of mastery
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <MarkdownContent content={level.proof_of_mastery.trim()} />
              </AccordionContent>
            </AccordionItem>
          )}

          {level.unlock_condition.trim() && (
            <AccordionItem value="unlock-condition">
              <AccordionTrigger className="text-base">
                <span className="flex items-center gap-2">
                  <Unlock className="h-4 w-4 text-primary" />
                  Unlock condition
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <MarkdownContent content={level.unlock_condition.trim()} />
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
}

export function SkillArchitectResult({ result }: { result: SkillArchitectResponse }) {
  return (
    <div className="space-y-4">
      {result.core_philosophy.trim() && (
        <ResultCallout icon={BookOpen} title="Core Philosophy" tone="info">
          <MarkdownContent content={result.core_philosophy.trim()} />
        </ResultCallout>
      )}

      <div className="space-y-4">
        {result.skill_tree_levels.length === 0 ? (
          <p className="text-sm text-muted-foreground">No skill tree levels returned.</p>
        ) : (
          result.skill_tree_levels.map((level, index) => (
            <LevelCard key={`${level.level_name}-${index}`} level={level} index={index} />
          ))
        )}
      </div>

      {result.critical_bottleneck.trim() && (
        <ResultCallout icon={Compass} title="Critical Bottleneck" tone="warn">
          <MarkdownContent content={result.critical_bottleneck.trim()} />
        </ResultCallout>
      )}

      {result.strategic_navigation.trim() && (
        <ResultCallout icon={Lightbulb} title="Strategic Navigation" tone="success">
          <MarkdownContent content={result.strategic_navigation.trim()} />
        </ResultCallout>
      )}
    </div>
  );
}
