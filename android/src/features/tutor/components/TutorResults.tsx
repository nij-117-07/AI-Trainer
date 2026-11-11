// src/features/tutor/components/TutorResults.tsx
/** Tutor body: the latest answer, its version controls, and the memory line for the next question. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronLeft, ChevronRight, HelpCircle, History, Lightbulb, Presentation, Trash2, type LucideIcon } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { Panel } from "@/components/tool/FormControls";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { TutorResponse } from "../types";

interface TutorResultsProps {
  active: TutorResponse | null;
  activeIndex: number;
  total: number;
  lastTopic: string;
  onGoTo: (index: number) => void;
  onClear: () => void;
  onStartFresh: () => void;
}

export function TutorResults({ active, activeIndex, total, lastTopic, onGoTo, onClear, onStartFresh }: TutorResultsProps) {
  const colors = useThemeColors();

  if (!active) {
    return (
      <EmptyHint
        icon={Presentation}
        title="No lesson yet"
        hint="Type your question in the form and tap Explain it to me. You get an explanation, an analogy, and a question to answer."
      />
    );
  }

  return (
    <Section>
      <View style={[styles.versionBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <History size={16} color={colors.mutedForeground} />
        <Text style={[styles.versionText, { color: colors.mutedForeground }]}>
          Answer {activeIndex + 1} of {total}
        </Text>
        <View style={styles.versionActions}>
          <IconButton
            label="Previous answer"
            icon={ChevronLeft}
            disabled={activeIndex <= 0}
            onPress={() => onGoTo(activeIndex - 1)}
          />
          <IconButton
            label="Next answer"
            icon={ChevronRight}
            disabled={activeIndex >= total - 1}
            onPress={() => onGoTo(activeIndex + 1)}
          />
          <IconButton label="Clear answers" icon={Trash2} onPress={onClear} />
        </View>
      </View>

      <Panel>
        <SectionTitle icon={Presentation} title="Explanation" />
        <MarkdownText content={active.adaptedExplanation} />
        <ListenButton text={active.adaptedExplanation} label="Explanation" />
      </Panel>

      {active.conceptAnalogy ? (
        <ResultCallout icon={Lightbulb} title="Analogy" tone="amber">
          <MarkdownText content={active.conceptAnalogy} />
          <ListenButton text={active.conceptAnalogy} label="Analogy" />
        </ResultCallout>
      ) : null}

      {active.tutorFeedback ? (
        <ResultCallout icon={HelpCircle} title="Your turn" tone="sky">
          <MarkdownText content={active.tutorFeedback} />
          <ListenButton text={active.tutorFeedback} label="Your turn" />
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>Type your answer in the form to keep going.</Text>
        </ResultCallout>
      ) : null}

      {lastTopic ? (
        <View style={[styles.memory, { borderColor: colors.border }]}>
          <Text style={[styles.memoryText, { color: colors.mutedForeground }]} numberOfLines={2}>
            Next answer builds on: {lastTopic}
          </Text>
          <Pressable
            onPress={onStartFresh}
            accessibilityRole="button"
            accessibilityLabel="Start a fresh topic"
            style={({ pressed }) => [styles.freshButton, pressed && { opacity: 0.6 }]}
          >
            <Text style={[styles.freshText, { color: colors.primary }]}>Start fresh</Text>
          </Pressable>
        </View>
      ) : null}
    </Section>
  );
}

function IconButton({
  label,
  icon: Icon,
  onPress,
  disabled = false,
}: {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  disabled?: boolean;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.iconButton,
        { borderColor: colors.border, backgroundColor: colors.background },
        pressed && { backgroundColor: colors.muted },
        disabled && styles.disabled,
      ]}
    >
      <Icon size={16} color={colors.foreground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  versionBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  versionText: {
    flex: 1,
    fontSize: 13,
  },
  versionActions: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.4,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  memory: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderTopWidth: 1,
    paddingTop: spacing.md,
  },
  memoryText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  freshButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  freshText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
