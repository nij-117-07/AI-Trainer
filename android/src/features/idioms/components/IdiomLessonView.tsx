// src/features/idioms/components/IdiomLessonView.tsx
/**
 * Renders one idiom lesson. The idiom is the hero, its meaning sits in a callout, and the context,
 * example sentences, practice prompt, and rationale sit under disclosures with one-line summaries.
 */
import { StyleSheet, Text, View } from "react-native";
import { BookOpen, Landmark, Lightbulb, MessagesSquare, PencilLine } from "lucide-react-native";
import { spacing, typeScale, useThemeColors } from "@/theme";
import { CopyButton } from "@/components/tool/CopyButton";
import { Disclosure } from "@/components/tool/Disclosure";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import type { IdiomLesson } from "../types";
import { plainSummary } from "../lib/text";

interface IdiomLessonViewProps {
  lesson: IdiomLesson;
  nativeLanguage: string;
}

export function IdiomLessonView({ lesson, nativeLanguage }: IdiomLessonViewProps) {
  const colors = useThemeColors();
  const native = nativeLanguage.trim();
  const equivalentLabel = native ? `Equivalent in ${native}` : "Equivalent in your language";
  const equivalent = lesson.equivalentInNativeLanguage;
  const meaningText = [lesson.figurativeMeaning, equivalent ? `${equivalentLabel}: ${equivalent}` : ""]
    .filter((part) => part !== "")
    .join("\n\n");
  const examples = lesson.dialogueScenario
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

  return (
    <>
      <View style={styles.hero}>
        <View style={styles.titleText}>
          <Text accessibilityRole="header" style={[typeScale.headline, { color: colors.foreground }]}>
            {lesson.idiomInTargetLanguage || "Untitled idiom"}
          </Text>
          {lesson.phoneticPronunciation !== "" && (
            <Text style={[typeScale.body, styles.phonetic, { color: colors.mutedForeground }]}>{lesson.phoneticPronunciation}</Text>
          )}
        </View>
        <TextActions text={lesson.idiomInTargetLanguage} label="idiom" />
      </View>

      {meaningText !== "" && (
        <ResultCallout icon={BookOpen} title="Meaning" tone="sky">
          {lesson.figurativeMeaning !== "" && <MarkdownText content={lesson.figurativeMeaning} />}
          {equivalent !== "" && <MarkdownText content={`**${equivalentLabel}:** ${equivalent}`} />}
          <TextActions text={meaningText} label="meaning" />
        </ResultCallout>
      )}

      {lesson.culturalContext !== "" && (
        <Disclosure icon={Landmark} title="Cultural context" summary={plainSummary(lesson.culturalContext)}>
          <MarkdownText content={lesson.culturalContext} />
          <TextActions text={lesson.culturalContext} label="cultural context" />
        </Disclosure>
      )}

      {examples.length > 0 && (
        <Disclosure icon={MessagesSquare} title="Example sentences" summary={plainSummary(lesson.dialogueScenario)}>
          {examples.map((line, index) => (
            <View key={index} style={styles.example}>
              <MarkdownText content={line} />
              <TextActions text={line} label="example sentence" />
            </View>
          ))}
        </Disclosure>
      )}

      {lesson.practicePrompt !== "" && (
        <Disclosure icon={PencilLine} title="Try it yourself" summary={plainSummary(lesson.practicePrompt)}>
          <MarkdownText content={lesson.practicePrompt} />
          <TextActions text={lesson.practicePrompt} label="practice prompt" />
        </Disclosure>
      )}

      {lesson.rationale !== "" && (
        <Disclosure icon={Lightbulb} title="Why this idiom" summary={plainSummary(lesson.rationale)}>
          <MarkdownText content={lesson.rationale} />
          <TextActions text={lesson.rationale} label="rationale" />
        </Disclosure>
      )}
    </>
  );
}

function TextActions({ text, label }: { text: string; label: string }) {
  return (
    <View style={styles.actions}>
      <ListenButton text={text} label={label} />
      <CopyButton text={text} label={`Copy ${label}`} />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  titleText: {
    flex: 1,
    gap: spacing.xs,
  },
  phonetic: {
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  example: {
    gap: spacing.sm,
  },
});
