// src/features/pareto-topics/components/ParetoResults.tsx
/**
 * Saved topic list page: a checklist of the core topics with their key ideas behind a
 * disclosure, a coverage panel, the areas to leave for later, and Find more topics in the footer.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Archive, Check, Circle, CircleCheck, Lightbulb, ListChecks, Percent, Target, type LucideIcon } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { keptCount } from "@/lib/kept";
import { ActionButton, ErrorText, Panel } from "@/components/tool/FormControls";
import { CopyButton } from "@/components/tool/CopyButton";
import { Disclosure } from "@/components/tool/Disclosure";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ListenButton } from "@/components/tool/ListenButton";
import { ResultCallout } from "@/components/tool/ResultCallout";
import type { ParetoListState } from "../hooks/useParetoList";
import type { ParetoResult, ParetoTopic } from "../types";

export function ParetoResults({
  result,
  coverage,
  onToggleKept,
}: {
  result: ParetoResult;
  coverage: number | null;
  onToggleKept: (index: number) => void;
}) {
  const colors = useThemeColors();
  const hasCoachNote = result.coachNote.trim() !== "";
  const kept = keptCount(result.topics);

  return (
    <View style={styles.list}>
      {coverage !== null && <CoveragePanel percent={coverage} />}

      {kept > 0 && (
        <View style={styles.status}>
          <Check size={14} color={colors.primary} />
          <Text style={[typeScale.caption, { color: colors.mutedForeground }]}>{kept} kept</Text>
        </View>
      )}

      {result.topics.length === 0 ? (
        <EmptyHint icon={Target} title="No topics returned" hint="Make the field more specific, then try again." />
      ) : (
        result.topics.map((topic, index) => (
          <TopicCard key={`${topic.title}-${index}`} topic={topic} onToggle={() => onToggleKept(index)} />
        ))
      )}

      {result.skipForNow.length > 0 && (
        <Disclosure title="Leave for later" icon={Archive} summary={`${result.skipForNow.length} areas can wait`}>
          <BulletList items={result.skipForNow} />
        </Disclosure>
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

export function ParetoResultsFooter({ state }: { state: ParetoListState }) {
  const { pending, error, saveError, findMore } = state;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ErrorText message={saveError} />
      <ActionButton label="Find more topics" icon={ListChecks} loading={pending} onPress={findMore} />
    </View>
  );
}

function CoveragePanel({ percent }: { percent: number }) {
  const colors = useThemeColors();
  return (
    <Panel>
      <Text accessibilityRole="header" style={[typeScale.title, { color: colors.foreground }]}>
        About {percent}% of the day-to-day work
      </Text>
      <Text style={[typeScale.caption, { color: colors.mutedForeground }]}>
        These topics are a rough estimate. They overlap, so treat the number as a guide.
      </Text>
    </Panel>
  );
}

function TopicCard({ topic, onToggle }: { topic: ParetoTopic; onToggle: () => void }) {
  const colors = useThemeColors();
  const name = topic.title.trim() || "topic";
  const why = topic.why.trim();
  const copyText = [topic.title.trim(), why, ...topic.keyIdeas.map((item) => `- ${item}`)].filter(Boolean).join("\n");
  const selected = topic.kept;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: selected ? colors.primary : colors.border }]}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityLabel={`Keep ${name}`}
        accessibilityState={{ checked: selected }}
        style={styles.head}
      >
        {selected ? <CircleCheck size={24} color={colors.primary} /> : <Circle size={24} color={colors.mutedForeground} />}
        <View style={styles.headText}>
          <Text style={[typeScale.title, { color: colors.foreground }]}>{topic.title}</Text>
          {topic.workShare !== null && <Chip icon={Percent} label={`About ${topic.workShare}% of work`} color={colors.foreground} />}
        </View>
      </Pressable>

      {why !== "" && <Text style={[typeScale.body, { color: colors.foreground }]}>{why}</Text>}

      <View style={styles.actions}>
        <CopyButton text={copyText} label={`Copy ${name}`} />
        <ListenButton text={why} label={name} />
      </View>

      {topic.keyIdeas.length > 0 && (
        <Disclosure title="Key ideas" icon={ListChecks} summary={`${topic.keyIdeas.length} things to learn`}>
          <BulletList items={topic.keyIdeas} />
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

function BulletList({ items }: { items: string[] }) {
  const colors = useThemeColors();
  return (
    <View style={styles.bullets}>
      {items.map((item, index) => (
        <View key={`${item}-${index}`} style={styles.bulletRow}>
          <Check size={16} color={colors.mutedForeground} style={styles.bulletIcon} />
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
  chip: {
    alignSelf: "flex-start",
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
