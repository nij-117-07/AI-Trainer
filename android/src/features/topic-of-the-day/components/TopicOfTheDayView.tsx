// src/features/topic-of-the-day/components/TopicOfTheDayView.tsx
/** Renders one topic: the title and date, then why it matters, key ideas, explanation, example, a question, and a task for today. */
import { StyleSheet, Text } from "react-native";
import { BookOpen, FlaskConical, Lightbulb, ListChecks, MessageCircleQuestion, Target } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { TopicOfTheDay } from "../types";

export function TopicOfTheDayView({ topic }: { topic: TopicOfTheDay }) {
  const colors = useThemeColors();
  const keyIdeas = topic.keyIdeas.map((idea) => `- ${idea}`).join("\n");

  return (
    <>
      <Panel>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>Topic for {topic.date}</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>{topic.title || "Untitled topic"}</Text>
      </Panel>

      <TopicPanel icon={Lightbulb} title="Why it matters" content={topic.whyItMatters} />
      <TopicPanel icon={ListChecks} title="Key ideas" content={keyIdeas} />
      <TopicPanel icon={BookOpen} title="Explained" content={topic.explanation} />
      <TopicPanel icon={FlaskConical} title="Worked example" content={topic.workedExample} />
      <TopicPanel icon={MessageCircleQuestion} title="Think about" content={topic.starterQuestion} />
      <TopicPanel icon={Target} title="Try it today" content={topic.tryToday} />
    </>
  );
}

function TopicPanel({ icon, title, content }: { icon: LucideIcon; title: string; content: string }) {
  if (content === "") return null;
  return (
    <Panel>
      <SectionTitle icon={icon} title={title} />
      <MarkdownText content={content} />
      <ListenButton text={content} label={title} />
    </Panel>
  );
}

const styles = StyleSheet.create({
  date: {
    fontSize: 13,
    fontWeight: "500",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 30,
  },
});
