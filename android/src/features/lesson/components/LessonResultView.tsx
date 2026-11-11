// src/features/lesson/components/LessonResultView.tsx
/**
 * Renders a generated lesson in three parts (Lesson, Vocabulary, Practice) that switch in place
 * with a segmented control. Long text sits under Disclosures, the first one open. Vocabulary is
 * shown as cards because the Markdown view has no table support.
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BookOpenText, Languages, Lightbulb, ListChecks, Target } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { pointerCursor } from "@/components/tool/FormControls";
import { CardGrid } from "@/components/tool/CardGrid";
import { CopyButton } from "@/components/tool/CopyButton";
import { Disclosure } from "@/components/tool/Disclosure";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import type { Lesson, VocabularyEntry } from "../types";

type Part = "lesson" | "vocabulary" | "practice";

const PARTS: { value: Part; label: string }[] = [
  { value: "lesson", label: "Lesson" },
  { value: "vocabulary", label: "Vocabulary" },
  { value: "practice", label: "Practice" },
];

export function LessonResultView({ lesson }: { lesson: Lesson }) {
  const colors = useThemeColors();
  const [part, setPart] = useState<Part>("lesson");
  const exercises = practiceText(lesson.practice);

  return (
    <>
      {lesson.header !== "" && (
        <Text accessibilityRole="header" style={[styles.header, { color: colors.foreground }]}>
          {lesson.header}
        </Text>
      )}

      <PartSegments value={part} onChange={setPart} />

      {part === "lesson" && (
        <>
          <Disclosure defaultOpen icon={Languages} title="Comparative analysis" summary={summaryOf(lesson.comparativeAnalysis)}>
            <SectionBody text={lesson.comparativeAnalysis} label="Analysis" />
          </Disclosure>
          <Disclosure icon={BookOpenText} title="Deep dive" summary={summaryOf(lesson.deepDive)}>
            <SectionBody text={lesson.deepDive} label="Deep dive" />
          </Disclosure>
          {lesson.nuance !== "" && (
            <Disclosure icon={Lightbulb} title="Insider tip" summary={summaryOf(lesson.nuance)}>
              <SectionBody text={lesson.nuance} label="Insider tip" />
            </Disclosure>
          )}
        </>
      )}

      {part === "vocabulary" && <VocabularyPart vocabulary={lesson.vocabulary} />}

      {part === "practice" && (
        <>
          <Disclosure defaultOpen icon={ListChecks} title="Exercises" summary={summaryOf(exercises)}>
            <SectionBody text={exercises} label="Exercises" emptyMessage="No exercises returned." />
          </Disclosure>
          {lesson.homework !== "" && (
            <Disclosure icon={Target} title="Homework" summary={summaryOf(lesson.homework)}>
              <SectionBody text={lesson.homework} label="Homework" />
            </Disclosure>
          )}
        </>
      )}
    </>
  );
}

function PartSegments({ value, onChange }: { value: Part; onChange: (part: Part) => void }) {
  const colors = useThemeColors();
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel="Lesson parts"
      style={[styles.segments, { borderColor: colors.border, backgroundColor: colors.card }]}
    >
      {PARTS.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            style={[styles.segment, pointerCursor, selected && { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.segmentText, { color: selected ? colors.primaryForeground : colors.foreground }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function VocabularyPart({ vocabulary }: { vocabulary: VocabularyEntry[] }) {
  if (vocabulary.length === 0) return <EmptyNote message="No vocabulary returned." />;
  return (
    <>
      <CardGrid>
        {vocabulary.map((entry, index) => (
          <WordCard key={`${entry.word}-${index}`} entry={entry} />
        ))}
      </CardGrid>
      <Actions text={vocabularyText(vocabulary)} label="Vocabulary" />
    </>
  );
}

function WordCard({ entry }: { entry: VocabularyEntry }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.word, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={styles.wordBody}>
        <Text selectable style={[styles.wordText, { color: colors.foreground }]}>
          {entry.word}
        </Text>
        {entry.ipa !== "" && <Text style={[styles.body, { color: colors.mutedForeground }]}>/{entry.ipa}/</Text>}
        {entry.translation !== "" && <Text style={[styles.body, { color: colors.foreground }]}>{entry.translation}</Text>}
        {entry.example !== "" && <Text style={[styles.example, { color: colors.mutedForeground }]}>{entry.example}</Text>}
      </View>
      <ListenButton text={entry.word} label={entry.word} />
    </View>
  );
}

function SectionBody({ text, label, emptyMessage = "Nothing was returned." }: { text: string; label: string; emptyMessage?: string }) {
  return (
    <>
      {text !== "" ? <MarkdownText content={text} /> : <EmptyNote message={emptyMessage} />}
      <Actions text={text} label={label} />
    </>
  );
}

function Actions({ text, label }: { text: string; label: string }) {
  if (text === "") return null;
  return (
    <View style={styles.actions}>
      <CopyButton text={text} label={`Copy ${label.toLowerCase()}`} />
      <ListenButton text={text} label={label} />
    </View>
  );
}

function EmptyNote({ message }: { message: string }) {
  const colors = useThemeColors();
  return <Text style={[styles.body, { color: colors.mutedForeground }]}>{message}</Text>;
}

function practiceText(practice: string[]): string {
  return practice.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function vocabularyText(vocabulary: VocabularyEntry[]): string {
  return vocabulary
    .map((entry) => [entry.word, entry.ipa ? `/${entry.ipa}/` : "", entry.translation, entry.example].filter(Boolean).join(" — "))
    .join("\n");
}

/** First non-empty line of the text, without Markdown marks, for a Disclosure summary. */
function summaryOf(text: string): string | undefined {
  const line = text
    .split("\n")
    .map((row) => row.replace(/^\s*(?:[-+*]|\d+\.)\s+/, "").replace(/[*_`#>]/g, "").trim())
    .find(Boolean);
  return line || undefined;
}

const styles = StyleSheet.create({
  header: {
    ...typeScale.title,
  },
  segments: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: shape.full,
    padding: spacing.xs,
  },
  segment: {
    flex: 1,
    minHeight: touchTarget,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentText: {
    ...typeScale.label,
    fontWeight: "600",
  },
  word: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: spacing.lg,
  },
  wordBody: {
    flex: 1,
    gap: spacing.xs,
  },
  wordText: {
    ...typeScale.title,
  },
  body: {
    ...typeScale.body,
  },
  example: {
    ...typeScale.body,
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
});
