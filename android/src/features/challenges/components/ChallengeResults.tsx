// src/features/challenges/components/ChallengeResults.tsx
/**
 * Challenge Giver result page: a checklist of challenges, with success criteria and hints behind
 * disclosures, and Find more in the footer. Hints appear only when the learner opens them.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check, Circle, CircleCheck, Clock, Flag, Hammer, Lightbulb, ListChecks, Pencil, Puzzle, Bug, MessagesSquare, Sprout, Gauge, Flame, type LucideIcon } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { keptCount } from "@/lib/kept";
import { ActionButton, ErrorText, pointerCursor } from "@/components/tool/FormControls";
import { CopyButton } from "@/components/tool/CopyButton";
import { Disclosure } from "@/components/tool/Disclosure";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ListenButton } from "@/components/tool/ListenButton";
import { ResultCallout } from "@/components/tool/ResultCallout";
import type { ChallengeGiverState } from "../hooks/useChallengeGiver";
import { challengeLevelOptions, challengeTypeOptions } from "../options";
import type { Challenge, ChallengeLevel, ChallengeResult, ChallengeType } from "../types";

const TYPE_ICONS: Record<ChallengeType, LucideIcon> = {
  solve: Puzzle,
  build: Hammer,
  debug: Bug,
  explain: MessagesSquare,
};

const LEVEL_ICONS: Record<ChallengeLevel, LucideIcon> = {
  beginner: Sprout,
  intermediate: Gauge,
  advanced: Flame,
};

export function EditFormButton({ onPress }: { onPress: () => void }) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Edit form"
      style={({ pressed }) => [styles.iconButton, pointerCursor, { borderColor: colors.border }, pressed && { backgroundColor: colors.muted }]}
    >
      <Pencil size={20} color={colors.foreground} />
    </Pressable>
  );
}

export function ChallengeResults({
  result,
  challengeType,
  skillLevel,
  onToggleKept,
}: {
  result: ChallengeResult;
  challengeType: ChallengeType;
  skillLevel: ChallengeLevel;
  onToggleKept: (index: number) => void;
}) {
  const colors = useThemeColors();
  const hasCoachNote = result.coachNote.trim() !== "";
  const kept = keptCount(result.challenges);

  return (
    <View style={styles.list}>
      {kept > 0 && (
        <View style={styles.status}>
          <Check size={14} color={colors.primary} />
          <Text style={[typeScale.caption, { color: colors.mutedForeground }]}>{kept} kept</Text>
        </View>
      )}

      {result.challenges.length === 0 ? (
        <EmptyHint icon={Flag} title="No challenges returned" hint="Change the topic or time, then try again." />
      ) : (
        result.challenges.map((challenge, index) => (
          <ChallengeCard
            key={`${challenge.title}-${index}`}
            challenge={challenge}
            challengeType={challengeType}
            skillLevel={skillLevel}
            onToggle={() => onToggleKept(index)}
          />
        ))
      )}

      {hasCoachNote && (
        <ResultCallout icon={Lightbulb} title="Coach note" tone="sky">
          <Text style={[typeScale.bodyLarge, { color: colors.foreground }]}>{result.coachNote.trim()}</Text>
          <View style={styles.actions}>
            <CopyButton text={result.coachNote} label="Copy coach note" />
            <ListenButton text={result.coachNote} label="Coach note" />
          </View>
        </ResultCallout>
      )}
    </View>
  );
}

export function ChallengeResultsFooter({ giver }: { giver: ChallengeGiverState }) {
  const { pending, error, saveError, give } = giver;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ErrorText message={saveError} />
      <ActionButton label="Find more" icon={ListChecks} loading={pending} onPress={give} />
    </View>
  );
}

function ChallengeCard({
  challenge,
  challengeType,
  skillLevel,
  onToggle,
}: {
  challenge: Challenge;
  challengeType: ChallengeType;
  skillLevel: ChallengeLevel;
  onToggle: () => void;
}) {
  const colors = useThemeColors();
  const name = challenge.title.trim() || "challenge";
  const prompt = challenge.prompt.trim();
  const copyText = [challenge.title.trim(), prompt, ...challenge.successCriteria.map((item) => `- ${item}`)]
    .filter(Boolean)
    .join("\n");
  const TypeIcon = TYPE_ICONS[challengeType];
  const LevelIcon = LEVEL_ICONS[skillLevel];
  const typeLabel = challengeTypeOptions.find((option) => option.value === challengeType)?.label ?? challengeType;
  const levelLabel = challengeLevelOptions.find((option) => option.value === skillLevel)?.label ?? skillLevel;
  const selected = challenge.kept;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: selected ? colors.primary : colors.border }]}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityLabel={`Keep ${name}`}
        accessibilityState={{ checked: selected }}
        style={styles.head}
      >
        {selected ? (
          <CircleCheck size={24} color={colors.primary} />
        ) : (
          <Circle size={24} color={colors.mutedForeground} />
        )}
        <View style={styles.headText}>
          <Text style={[typeScale.title, { color: colors.foreground }]}>{challenge.title}</Text>
          <View style={styles.meta}>
            <Chip icon={TypeIcon} label={typeLabel} color={colors.foreground} />
            <Chip icon={LevelIcon} label={levelLabel} color={colors.foreground} />
            {challenge.estimatedMinutes !== null && (
              <Chip icon={Clock} label={`About ${challenge.estimatedMinutes} min`} color={colors.mutedForeground} />
            )}
          </View>
        </View>
      </Pressable>

      {prompt !== "" && <Text style={[typeScale.body, { color: colors.foreground }]}>{prompt}</Text>}

      <View style={styles.actions}>
        <CopyButton text={copyText} label={`Copy ${name}`} />
        <ListenButton text={prompt} label={name} />
      </View>

      {challenge.successCriteria.length > 0 && (
        <Disclosure
          title="Success criteria"
          icon={ListChecks}
          summary={`${challenge.successCriteria.length} checks to confirm you are done`}
        >
          <NumberedList items={challenge.successCriteria} marker="check" />
        </Disclosure>
      )}

      {challenge.hints.length > 0 && (
        <Disclosure title="Hints" icon={Lightbulb} summary="Open only when you are stuck">
          <NumberedList items={challenge.hints} marker="number" />
        </Disclosure>
      )}
    </View>
  );
}

function Chip({ icon: Icon, label, color }: { icon: LucideIcon; label: string; color: string }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.chip, { backgroundColor: colors.muted, borderColor: colors.border }]}>
      <Icon size={12} color={color} />
      <Text style={[typeScale.caption, { color }]}>{label}</Text>
    </View>
  );
}

function NumberedList({ items, marker }: { items: string[]; marker: "check" | "number" }) {
  const colors = useThemeColors();
  return (
    <View style={styles.bullets}>
      {items.map((item, index) => (
        <View key={`${item}-${index}`} style={styles.bulletRow}>
          {marker === "check" ? (
            <Check size={16} color={colors.mutedForeground} style={styles.bulletIcon} />
          ) : (
            <Text style={[typeScale.body, { color: colors.mutedForeground }]}>{index + 1}.</Text>
          )}
          <Text style={[typeScale.body, styles.bulletText, { color: colors.foreground }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.sm,
  },
  iconButton: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    gap: spacing.sm,
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  card: {
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  head: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  headText: {
    flex: 1,
    gap: spacing.xs,
  },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: shape.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
  bullets: {
    gap: spacing.sm,
  },
  bulletRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  bulletIcon: {
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
  },
});
