// src/features/lesson/components/LessonResultView.tsx
/**
 * Renders a generated lesson: header, comparative analysis, deep dive, vocabulary, practice
 * exercises, insider tip, and homework. Vocabulary is shown as cards because the Markdown view
 * has no table support.
 */
import { StyleSheet, Text, View } from "react-native";
import { BookOpenText, Languages, ListChecks, Lightbulb, Target } from "lucide-react-native";
import { useThemeColors } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { Lesson } from "../types";

export function LessonResultView({ lesson }: { lesson: Lesson }) {
  const colors = useThemeColors();
  return (
    <>
      {lesson.header !== "" && (
        <Panel>
          <Text style={[styles.header, { color: colors.foreground }]}>{lesson.header}</Text>
        </Panel>
      )}

      <Panel>
        <SectionTitle icon={Languages} title="Comparative analysis" />
        {lesson.comparativeAnalysis !== "" ? (
          <MarkdownText content={lesson.comparativeAnalysis} />
        ) : (
          <EmptyNote message="Nothing was returned." />
        )}
      </Panel>

      <Panel>
        <SectionTitle icon={BookOpenText} title="Deep dive" />
        {lesson.deepDive !== "" ? <MarkdownText content={lesson.deepDive} /> : <EmptyNote message="Nothing was returned." />}
      </Panel>

      <Panel>
        <SectionTitle icon={ListChecks} title="Vocabulary" />
        {lesson.vocabulary.length === 0 ? (
          <EmptyNote message="No vocabulary returned." />
        ) : (
          lesson.vocabulary.map((entry, index) => (
            <View key={`${entry.word}-${index}`} style={[styles.word, { borderColor: colors.border }]}>
              <Text style={[styles.wordText, { color: colors.foreground }]}>{entry.word}</Text>
              {entry.ipa !== "" && <Text style={[styles.ipa, { color: colors.mutedForeground }]}>/{entry.ipa}/</Text>}
              {entry.translation !== "" && <Text style={[styles.body, { color: colors.foreground }]}>{entry.translation}</Text>}
              {entry.example !== "" && <Text style={[styles.example, { color: colors.mutedForeground }]}>{entry.example}</Text>}
            </View>
          ))
        )}
      </Panel>

      <Panel>
        <SectionTitle icon={Target} title="Practice" />
        {lesson.practice.length === 0 ? (
          <EmptyNote message="No exercises returned." />
        ) : (
          <MarkdownText content={lesson.practice.map((item, index) => `${index + 1}. ${item}`).join("\n")} />
        )}
      </Panel>

      {lesson.nuance !== "" && (
        <ResultCallout icon={Lightbulb} title="Insider tip" tone="sky">
          <MarkdownText content={lesson.nuance} />
        </ResultCallout>
      )}

      {lesson.homework !== "" && (
        <ResultCallout icon={Target} title="Homework mission" tone="amber">
          <MarkdownText content={lesson.homework} />
        </ResultCallout>
      )}
    </>
  );
}

function EmptyNote({ message }: { message: string }) {
  const colors = useThemeColors();
  return <Text style={[styles.body, { color: colors.mutedForeground }]}>{message}</Text>;
}

const styles = StyleSheet.create({
  header: {
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  word: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 4,
  },
  wordText: {
    fontSize: 17,
    fontWeight: "600",
  },
  ipa: {
    fontSize: 14,
  },
  example: {
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
  },
});
