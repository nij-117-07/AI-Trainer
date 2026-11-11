// src/features/executive-eq/components/SimulationBoard.tsx
/**
 * The running Executive EQ simulation on the practice page: the scene, the counterpart profile
 * (collapsed), the latest briefing, and the transcript as a chat. The reply box lives in the page
 * footer. Grades for each reply are shown as chips at the top, and each reply's feedback lists what
 * worked and what to improve above the coach's evaluation.
 */
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Bot, Check, Eye, X, type LucideIcon } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors, type Tone } from "@/theme";
import { CopyButton } from "@/components/tool/CopyButton";
import { Disclosure } from "@/components/tool/Disclosure";
import { Panel } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { TagList } from "@/components/tool/TagList";
import { useToolScroll } from "@/components/tool/ToolScrollContext";
import { gradeByLogIndex } from "../lib/transcript";
import type { EvaluationResult, ExecutiveEqSession } from "../types";

interface SimulationBoardProps {
  session: ExecutiveEqSession;
  busy: boolean;
}

const GRADE_TONES: Record<string, Tone> = { A: "emerald", B: "sky", C: "amber", D: "rose", F: "rose" };

export function SimulationBoard({ session, busy }: SimulationBoardProps) {
  const colors = useThemeColors();
  const scroll = useToolScroll();
  const { scenario } = session;
  const npc = scenario.npcProfile;
  const grades = gradeByLogIndex(session);

  useEffect(() => {
    scroll?.current?.scrollToEnd({ animated: true });
  }, [session.log.length, busy, scroll]);

  return (
    <>
      <Panel>
        <SectionTitle icon={Eye} title={scenario.scenarioTitle || "Simulation"} />
        {session.grades.length > 0 && (
          <View style={styles.gradeRow}>
            <Text style={[styles.caption, { color: colors.mutedForeground }]}>Grades</Text>
            {session.grades.map((grade, index) => {
              const tone = colors.tone[GRADE_TONES[grade.strategicGrade] ?? "amber"];
              return (
                <View
                  key={index}
                  accessible
                  accessibilityLabel={`Reply ${index + 1} grade ${grade.strategicGrade}`}
                  style={[styles.grade, { backgroundColor: tone.bg, borderColor: tone.border }]}
                >
                  <Text style={[styles.gradeText, { color: tone.fg }]}>{grade.strategicGrade}</Text>
                </View>
              );
            })}
          </View>
        )}
        {scenario.settingDescription !== "" && <MarkdownText content={scenario.settingDescription} />}
        <ListenButton text={scenario.settingDescription} label="Scene" />
        {scenario.initialStakes !== "" && (
          <Text style={[styles.stakes, { color: colors.tone.rose.fg }]}>{scenario.initialStakes}</Text>
        )}
      </Panel>

      <Disclosure icon={Bot} title={npc.name || "Counterpart"} summary={npc.title || undefined}>
        <LabeledLine label="Personality" value={npc.personality} />
        <LabeledLine label="Hidden motive" value={npc.hiddenMotive} />
        <LabeledLine label="Tell" value={npc.tell} />
      </Disclosure>

      {session.lastBriefing && (
        <ResultCallout icon={Eye} title="Read the room" tone="sky">
          {session.lastBriefing.meetingScenario !== "" && <MarkdownText content={session.lastBriefing.meetingScenario} />}
          <ListenButton text={session.lastBriefing.meetingScenario} label="Briefing" />
          {session.lastBriefing.rationale !== "" && (
            <LabeledLine label="Rationale" value={session.lastBriefing.rationale} />
          )}
          {session.lastBriefing.eqCoachMessage !== "" && (
            <View style={[styles.coach, { borderColor: colors.primary }]}>
              <Text accessibilityRole="header" style={[styles.heading, { color: colors.primary }]}>
                EQ coaching
              </Text>
              <Text style={[styles.body, { color: colors.foreground }]}>{session.lastBriefing.eqCoachMessage}</Text>
            </View>
          )}
          {session.lastBriefing.suggestedStrategies.length > 0 && (
            <View style={styles.strategies}>
              <Text accessibilityRole="header" style={[styles.heading, { color: colors.foreground }]}>
                Suggested strategies
              </Text>
              <TagList items={session.lastBriefing.suggestedStrategies} />
            </View>
          )}
        </ResultCallout>
      )}

      <View style={styles.transcript}>
        {session.log.length === 0 ? (
          <Text style={[styles.body, { color: colors.mutedForeground }]}>The NPC has not spoken yet.</Text>
        ) : (
          session.log.map((entry, index) => {
            if (entry.role === "user") {
              return (
                <View key={index} style={styles.userEntry}>
                  <Text style={[styles.caption, { color: colors.mutedForeground }]}>You</Text>
                  <View style={[styles.userBubble, { backgroundColor: colors.muted }]}>
                    <MarkdownText content={entry.content} />
                  </View>
                </View>
              );
            }
            const grade = grades.get(index);
            return (
              <View key={index} style={styles.assistantEntry}>
                <Text style={[styles.caption, { color: colors.mutedForeground }]}>Simulation</Text>
                {grade && <EvaluationLists evaluation={grade} />}
                <MarkdownText content={entry.content} />
                <View style={styles.actions}>
                  <ListenButton text={entry.content} label="Reply" />
                  <CopyButton text={entry.content} label="Copy reply" />
                </View>
              </View>
            );
          })
        )}
        {busy && (
          <View
            accessibilityLiveRegion="polite"
            style={[styles.status, { backgroundColor: colors.muted, borderColor: colors.border }]}
          >
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.body, { color: colors.mutedForeground }]}>Waiting for the reply…</Text>
          </View>
        )}
      </View>
    </>
  );
}

function EvaluationLists({ evaluation }: { evaluation: EvaluationResult }) {
  return (
    <View style={styles.feedback}>
      <FeedbackList title="What worked" items={evaluation.strengths} icon={Check} tone="emerald" />
      <FeedbackList title="To improve" items={evaluation.criticalFlaws} icon={X} tone="rose" />
    </View>
  );
}

function FeedbackList({ title, items, icon: Icon, tone }: { title: string; items: string[]; icon: LucideIcon; tone: Tone }) {
  const colors = useThemeColors();
  if (items.length === 0) return null;
  return (
    <View style={styles.feedbackGroup}>
      <Text accessibilityRole="header" style={[styles.heading, { color: colors.mutedForeground }]}>
        {title}
      </Text>
      {items.map((item, index) => (
        <View key={`${index}-${item}`} style={styles.feedbackItem}>
          <View style={styles.feedbackIcon}>
            <Icon size={16} color={colors.tone[tone].fg} />
          </View>
          <Text selectable style={[styles.body, styles.feedbackText, { color: colors.foreground }]}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

function LabeledLine({ label, value }: { label: string; value: string }) {
  const colors = useThemeColors();
  if (!value) return null;
  return (
    <Text style={[styles.body, { color: colors.foreground }]}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}: </Text>
      {value}
    </Text>
  );
}

const styles = StyleSheet.create({
  heading: {
    ...typeScale.caption,
    fontWeight: "600",
  },
  caption: {
    ...typeScale.caption,
  },
  body: {
    ...typeScale.body,
  },
  label: {
    ...typeScale.caption,
    fontWeight: "600",
  },
  stakes: {
    ...typeScale.body,
    fontWeight: "600",
  },
  gradeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  grade: {
    width: 28,
    height: 28,
    borderRadius: shape.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  gradeText: {
    ...typeScale.caption,
    fontWeight: "700",
  },
  coach: {
    borderLeftWidth: 2,
    paddingLeft: spacing.md,
    gap: spacing.xs,
  },
  strategies: {
    gap: spacing.sm,
  },
  transcript: {
    gap: spacing.md,
  },
  feedback: {
    gap: spacing.md,
  },
  feedbackGroup: {
    gap: spacing.sm,
  },
  feedbackItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  feedbackIcon: {
    paddingTop: spacing.xs,
  },
  feedbackText: {
    flex: 1,
  },
  userEntry: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  userBubble: {
    maxWidth: "80%",
    borderRadius: shape.lg,
    borderTopRightRadius: shape.xs,
    padding: spacing.md,
  },
  assistantEntry: {
    gap: spacing.xs,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: spacing.md,
  },
});
