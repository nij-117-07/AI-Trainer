// src/features/idioms/components/IdiomLessonView.tsx
/** Renders one idiom lesson: the idiom, its meaning and equivalent, context, a dialogue, and a practice prompt. */
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BookOpen, Landmark, Lightbulb, MessagesSquare, PencilLine } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ListenButton } from "@/components/tool/ListenButton";
import { Panel } from "@/components/tool/FormControls";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { IdiomLesson } from "../types";

interface IdiomLessonViewProps {
  lesson: IdiomLesson;
  nativeLanguage: string;
}

export function IdiomLessonView({ lesson, nativeLanguage }: IdiomLessonViewProps) {
  const colors = useThemeColors();
  const native = nativeLanguage.trim();
  const equivalentLabel = native ? `Equivalent in ${native}` : "Equivalent in your language";

  return (
    <>
      <Panel>
        <View style={styles.titleRow}>
          <View style={styles.titleText}>
            <Text style={[styles.idiom, { color: colors.foreground }]}>{lesson.idiomInTargetLanguage || "Untitled idiom"}</Text>
            {lesson.phoneticPronunciation !== "" && (
              <Text style={[styles.phonetic, { color: colors.mutedForeground }]}>{lesson.phoneticPronunciation}</Text>
            )}
          </View>
          <ListenButton text={lesson.idiomInTargetLanguage} label="Idiom" />
        </View>
      </Panel>

      {(lesson.figurativeMeaning !== "" || lesson.equivalentInNativeLanguage !== "") && (
        <LessonPanel icon={BookOpen} title="What it means">
          {lesson.figurativeMeaning !== "" && <MarkdownText content={lesson.figurativeMeaning} />}
          {lesson.equivalentInNativeLanguage !== "" && (
            <MarkdownText content={`**${equivalentLabel}:** ${lesson.equivalentInNativeLanguage}`} />
          )}
        </LessonPanel>
      )}
      {lesson.culturalContext !== "" && (
        <LessonPanel icon={Landmark} title="Cultural context">
          <MarkdownText content={lesson.culturalContext} />
        </LessonPanel>
      )}
      {lesson.dialogueScenario !== "" && (
        <LessonPanel icon={MessagesSquare} title="In a real conversation">
          <MarkdownText content={lesson.dialogueScenario} />
        </LessonPanel>
      )}
      {lesson.practicePrompt !== "" && (
        <LessonPanel icon={PencilLine} title="Try it yourself">
          <MarkdownText content={lesson.practicePrompt} />
        </LessonPanel>
      )}
      {lesson.rationale !== "" && (
        <LessonPanel icon={Lightbulb} title="Why this idiom">
          <MarkdownText content={lesson.rationale} />
        </LessonPanel>
      )}
    </>
  );
}

function LessonPanel({ icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <Panel>
      <SectionTitle icon={icon} title={title} />
      {children}
    </Panel>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  titleText: {
    flex: 1,
  },
  idiom: {
    fontSize: 22,
    fontWeight: "700",
  },
  phonetic: {
    fontSize: 15,
    fontStyle: "italic",
  },
});
