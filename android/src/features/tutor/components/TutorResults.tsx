// src/features/tutor/components/TutorResults.tsx
/** Tutor body: the answer first, the analogy under a disclosure, and the note for the next question. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronLeft, ChevronRight, HelpCircle, Lightbulb, Presentation, Trash2, type LucideIcon } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { Disclosure } from "@/components/tool/Disclosure";
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
    return <EmptyHint icon={Presentation} title="No answer yet" hint="Tap New question to start a lesson." />;
  }

  return (
    <Section>
      <View style={[styles.versionBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
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

      {active.tutorFeedback ? (
        <ResultCallout icon={HelpCircle} title="Your turn" tone="sky">
          <MarkdownText content={active.tutorFeedback} />
          <ListenButton text={active.tutorFeedback} label="Your turn" />
        </ResultCallout>
      ) : null}

      {active.conceptAnalogy ? (
        <Disclosure icon={Lightbulb} title="Analogy" summary={plainPreview(active.conceptAnalogy)}>
          <MarkdownText content={active.conceptAnalogy} />
          <ListenButton text={active.conceptAnalogy} label="Analogy" />
        </Disclosure>
      ) : null}

      {lastTopic ? (
        <View style={styles.memory}>
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

function plainPreview(markdown: string): string {
  return markdown.replace(/[*_`#>]/g, "").replace(/\s+/g, " ").trim();
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
      <Icon size={20} color={colors.foreground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  versionBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: shape.lg,
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
  },
  versionText: {
    flex: 1,
    ...typeScale.label,
  },
  versionActions: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  iconButton: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.4,
  },
  memory: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  memoryText: {
    flex: 1,
    ...typeScale.label,
    fontWeight: "400",
  },
  freshButton: {
    minHeight: touchTarget,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  freshText: {
    ...typeScale.label,
    fontWeight: "600",
  },
});
