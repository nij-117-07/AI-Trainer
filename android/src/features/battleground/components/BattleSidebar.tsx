// src/features/battleground/components/BattleSidebar.tsx
/**
 * The battle sidebar: the status and health of both sides, your forces, the opponent, and the
 * mission. On tablet and desktop it sits in the side panel; on a phone it opens as a sheet.
 */
import { StyleSheet, Text, View } from "react-native";
import { Flag, Shield, Target } from "lucide-react-native";
import { spacing, typeScale, useThemeColors } from "@/theme";
import { Disclosure } from "@/components/tool/Disclosure";
import { ListenButton } from "@/components/tool/ListenButton";
import { Panel } from "@/components/tool/FormControls";
import { TagList } from "@/components/tool/TagList";
import { averageScore } from "../lib/game";
import { textList } from "../lib/text";
import type { BattleSession } from "../types";
import { HealthBar, Pill } from "./BattleParts";

export function BattleSidebar({ session }: { session: BattleSession }) {
  const colors = useThemeColors();
  const average = Math.round(averageScore(session.roundScores) * 100);
  const loadout = Object.entries(session.userResources).map(([name, count]) => `${name} × ${count}`);
  const environment = Object.entries(session.battlefieldEnvironment).map(([key, value]) => `${key}: ${value}`);

  return (
    <>
      <Panel>
        <View style={styles.statusRow}>
          <Pill label={`Round ${session.roundNumber}`} filled />
          <Pill label={session.difficulty} />
          <Text style={[styles.strong, { color: colors.foreground }]}>Avg {average}%</Text>
        </View>
        <HealthBar label="Your health" value={session.userHealth} />
        <HealthBar label="Opponent health" value={session.opponentHealth} />
      </Panel>

      <Disclosure
        title="Your forces"
        icon={Shield}
        summary={session.userProfile.rank ? `${session.userProfile.callsign} · ${session.userProfile.rank}` : session.userProfile.callsign}
      >
        {session.userProfile.combatDoctrine !== "" && (
          <Text style={[styles.body, { color: colors.foreground }]}>{session.userProfile.combatDoctrine}</Text>
        )}
        {loadout.length > 0 && <TagList items={loadout} />}
        {textList(session.userProfile.strengths).length > 0 && (
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            Strengths: {textList(session.userProfile.strengths).join(", ")}
          </Text>
        )}
      </Disclosure>

      <Disclosure
        title="Opponent"
        icon={Target}
        summary={session.opponentProfile.title ? `${session.opponentProfile.name} · ${session.opponentProfile.title}` : session.opponentProfile.name}
      >
        {session.opponentStrategy !== "" && (
          <Text style={[styles.body, { color: colors.foreground }]}>{session.opponentStrategy}</Text>
        )}
        {textList(session.opponentProfile.signatureTactics).length > 0 && (
          <TagList items={textList(session.opponentProfile.signatureTactics)} />
        )}
        {textList(session.opponentProfile.weaknesses).length > 0 && (
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            Weak points: {textList(session.opponentProfile.weaknesses).join(", ")}
          </Text>
        )}
        {session.opponentLearningLog !== "" && (
          <Text style={[styles.label, { color: colors.mutedForeground }]}>{session.opponentLearningLog}</Text>
        )}
      </Disclosure>

      <Disclosure title="Mission" icon={Flag} summary={session.missionObjective}>
        <Text style={[styles.body, { color: colors.foreground }]}>{session.missionObjective}</Text>
        <ListenButton text={session.missionObjective} label="Mission" />
        {session.scenarioContext !== "" && (
          <Text style={[styles.body, { color: colors.foreground }]}>{session.scenarioContext}</Text>
        )}
        {environment.length > 0 && <TagList items={environment} />}
        {textList(session.rulesOfEngagement).length > 0 && <TagList items={textList(session.rulesOfEngagement)} />}
      </Disclosure>
    </>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
  },
  strong: {
    ...typeScale.label,
    fontWeight: "600",
  },
  body: {
    ...typeScale.body,
  },
  label: {
    ...typeScale.label,
  },
});
