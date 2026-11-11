// src/features/explainer/components/TutorialSteps.tsx
/**
 * Shows a generated tutorial as numbered steps. Each step starts at a heading of the shallowest
 * level that repeats, and is a Disclosure: closed, it shows the step title; opened, the step text.
 * Text before the first step stays visible above the list. Text with no repeated heading is shown whole.
 */
import { StyleSheet, View } from "react-native";
import { spacing } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
import { Disclosure } from "@/components/tool/Disclosure";
import { MarkdownText } from "@/components/tool/MarkdownText";

const HEADING = /^(#{1,6})\s+(.*)$/;
const FENCE = /^\s*```/;

interface TutorialStep {
  title: string;
  body: string;
}

export function splitTutorial(markdown: string): { intro: string; steps: TutorialStep[] } {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const headings: { index: number; level: number; title: string }[] = [];
  let inFence = false;

  lines.forEach((line, index) => {
    if (FENCE.test(line)) {
      inFence = !inFence;
      return;
    }
    const match = inFence ? null : HEADING.exec(line.trim());
    if (match) headings.push({ index, level: match[1].length, title: match[2].trim() });
  });

  const levels = [...new Set(headings.map((heading) => heading.level))].sort((a, b) => a - b);
  const stepLevel = levels.find((level) => headings.filter((heading) => heading.level === level).length > 1);
  if (stepLevel === undefined) return { intro: "", steps: [] };

  const starts = headings.filter((heading) => heading.level === stepLevel);
  const intro = lines.slice(0, starts[0].index).join("\n").trim();
  const steps = starts.map((start, index) => ({
    title: start.title,
    body: lines.slice(start.index + 1, starts[index + 1]?.index ?? lines.length).join("\n").trim(),
  }));

  return { intro, steps };
}

export function TutorialSteps({ content }: { content: string }) {
  const { intro, steps } = splitTutorial(content);

  if (steps.length === 0) {
    return (
      <Panel>
        <MarkdownText content={content} />
      </Panel>
    );
  }

  return (
    <View style={styles.list}>
      {intro ? (
        <Panel>
          <MarkdownText content={intro} />
        </Panel>
      ) : null}
      {steps.map((step, index) => (
        <Disclosure key={index} title={`Step ${index + 1}`} summary={step.title}>
          <MarkdownText content={step.body} />
        </Disclosure>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
});
