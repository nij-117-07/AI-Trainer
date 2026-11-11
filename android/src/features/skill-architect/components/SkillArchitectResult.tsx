// src/features/skill-architect/components/SkillArchitectResult.tsx
/**
 * The tree's background notes: core philosophy, critical bottleneck, and strategic navigation.
 * Each one starts collapsed, so the levels stay the focus of the page.
 */
import { BookOpen, Compass, Lightbulb } from "lucide-react-native";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { Disclosure } from "@/components/tool/Disclosure";
import { ListenButton } from "@/components/tool/ListenButton";
import type { SkillArchitectResponse } from "../types";

function hasText(value: string): boolean {
  return value.trim() !== "";
}

export function SkillArchitectResult({ response }: { response: SkillArchitectResponse }) {
  return (
    <>
      {hasText(response.corePhilosophy) && (
        <Disclosure title="Core philosophy" icon={BookOpen}>
          <MarkdownText content={response.corePhilosophy.trim()} />
          <ListenButton text={response.corePhilosophy} label="Core philosophy" />
        </Disclosure>
      )}

      {hasText(response.criticalBottleneck) && (
        <Disclosure title="Critical bottleneck" icon={Compass}>
          <MarkdownText content={response.criticalBottleneck.trim()} />
          <ListenButton text={response.criticalBottleneck} label="Critical bottleneck" />
        </Disclosure>
      )}

      {hasText(response.strategicNavigation) && (
        <Disclosure title="Strategic navigation" icon={Lightbulb}>
          <MarkdownText content={response.strategicNavigation.trim()} />
          <ListenButton text={response.strategicNavigation} label="Strategic navigation" />
        </Disclosure>
      )}
    </>
  );
}
