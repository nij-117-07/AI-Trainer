// src/features/topic-of-the-day/components/TopicSections.tsx
/** The parts of one topic, in reading order. Empty parts are skipped. */
import { StyleSheet, View } from "react-native";
import { BookOpen, FlaskConical, Lightbulb, ListChecks, MessageCircleQuestion, Target } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { spacing } from "@/theme";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { TopicOfTheDay } from "../types";

export function TopicSections({ topic }: { topic: TopicOfTheDay }) {
  const keyIdeas = topic.keyIdeas.map((idea) => `- ${idea}`).join("\n");

  return (
    <>
      <TopicPart icon={Lightbulb} title="Why it matters" content={topic.whyItMatters} />
      <TopicPart icon={ListChecks} title="Key ideas" content={keyIdeas} />
      <TopicPart icon={BookOpen} title="Explained" content={topic.explanation} />
      <TopicPart icon={FlaskConical} title="Worked example" content={topic.workedExample} />
      <TopicPart icon={MessageCircleQuestion} title="Think about" content={topic.starterQuestion} />
      <TopicPart icon={Target} title="Try it today" content={topic.tryToday} />
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
});
