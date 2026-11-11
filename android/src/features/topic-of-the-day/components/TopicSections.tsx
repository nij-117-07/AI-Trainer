// src/features/topic-of-the-day/components/TopicSections.tsx
/**
 * The parts of one topic. TopicHero shows the focus and today's task first. TopicSections holds the
 * reading parts below it, in reading order. Empty parts are skipped.
 */
import { StyleSheet, Text, View } from "react-native";
import { BookOpen, FlaskConical, Lightbulb, ListChecks, MessageCircleQuestion, Target } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { spacing, typeScale, useThemeColors } from "@/theme";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { Panel } from "@/components/tool/FormControls";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { SavedTopic, TopicOfTheDay } from "../types";

export function TopicHero({ topic }: { topic: SavedTopic }) {
  const colors = useThemeColors();
  const meta = [topic.focus, topic.date].filter(Boolean).join(" · ");
  if (!meta && topic.tryToday === "") return null;
  return (
    <Panel>
      {meta ? <Text style={[styles.meta, { color: colors.mutedForeground }]}>{meta}</Text> : null}
      <TopicPart icon={Target} title="Try it today" content={topic.tryToday} />
    </Panel>
  );
}

export function TopicSections({ topic }: { topic: TopicOfTheDay }) {
  const keyIdeas = topic.keyIdeas.map((idea) => `- ${idea}`).join("\n");

  return (
    <>
      <TopicPart icon={Lightbulb} title="Why it matters" content={topic.whyItMatters} />
      <TopicPart icon={ListChecks} title="Key ideas" content={keyIdeas} />
      <TopicPart icon={BookOpen} title="Explained" content={topic.explanation} />
      <TopicPart icon={FlaskConical} title="Worked example" content={topic.workedExample} />
      <TopicPart icon={MessageCircleQuestion} title="Think about" content={topic.starterQuestion} />
    </>
  );
}

function TopicPart({ icon, title, content }: { icon: LucideIcon; title: string; content: string }) {
  if (content === "") return null;
  return (
    <View style={styles.part}>
      <SectionTitle icon={icon} title={title} />
      <MarkdownText content={content} />
      <ListenButton text={content} label={title} />
    </View>
  );
}

const styles = StyleSheet.create({
  part: {
    gap: spacing.sm,
  },
  meta: {
    ...typeScale.caption,
  },
});
