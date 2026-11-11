// src/features/executive-eq/components/SimulationBoard.tsx
/**
 * The running Executive EQ simulation on the practice page: the scene and NPC, the latest
 * briefing, and the transcript. The reply box lives in the page footer. Grades for each reply are
 * shown as chips at the top.
 */
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Bot, Eye } from "lucide-react-native";
import { radius, spacing, useThemeColors, type Tone } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { TagList } from "@/components/tool/TagList";
import { useToolScroll } from "@/components/tool/ToolScrollContext";
import type { ExecutiveEqSession } from "../types";

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
  const npcLine = [npc.name, npc.title].filter(Boolean).join(" · ");

  useEffect(() => {
    scroll?.current?.scrollToEnd({ animated: true });
  }, [session.log.length, busy, scroll]);

  return (
    <>
      <Panel>
        <SectionTitle icon={Eye} title={scenario.scenarioTitle || "Simulation"} />
        {npcLine !== "" && <Text style={[styles.meta, { color: colors.mutedForeground }]}>{npcLine}</Text>}
        {session.grades.length > 0 && (
          <View style={styles.gradeRow}>
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>Grades</Text>
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
      </Panel>

      <Panel>
        <Text accessibilityRole="header" style={[styles.heading, { color: colors.foreground }]}>
          The scene
        </Text>
        {scenario.settingDescription !== "" && <MarkdownText content={scenario.settingDescription} />}
        <ListenButton text={scenario.settingDescription} label="Scene" />
        {scenario.initialStakes !== "" && (
          <Text style={[styles.stakes, { color: colors.tone.rose.fg }]}>{scenario.initialStakes}</Text>
        )}
      </Panel>

      <Panel>
        <SectionTitle icon={Bot} title={npc.name || "Counterpart"} />
        <LabeledLine label="Personality" value={npc.personality} />
        <LabeledLine label="Hidden motive" value={npc.hiddenMotive} />
        <LabeledLine label="Tell" value={npc.tell} />
      </Panel>

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

      <Panel>
        <SectionTitle icon={Bot} title="Transcript" />
        {session.log.length === 0 ? (
          <Text style={[styles.body, { color: colors.mutedForeground }]}>The NPC has not spoken yet.</Text>
        ) : (
          session.log.map((entry, index) => (
            <View key={index} style={styles.entry}>
              <Text style={[styles.speaker, { color: colors.mutedForeground }]}>
                {entry.role === "user" ? "You" : "Simulation"}
              </Text>
              <MarkdownText content={entry.content} />
              {entry.role !== "user" && <ListenButton text={entry.content} label="Reply" />}
            </View>
          ))
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
      </Panel>
    </>
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
    fontSize: 15,
    fontWeight: "600",
  },
  meta: {
    fontSize: 13,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
  stakes: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  gradeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  grade: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  gradeText: {
    fontSize: 13,
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
  entry: {
    gap: spacing.xs,
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  speaker: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
});
