// src/features/roadmap/components/RoadmapCard.tsx
/** One roadmap in the list: subject, levels, item counts, progress, and open and delete actions. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ArrowRight, MapPinned, Trash2 } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { computeProgress, countSubtopics, nextMainPoint } from "../lib/progress";
import type { Roadmap } from "../types";
import { IconButton } from "./ItemControls";
import { ProgressBar } from "./ProgressBar";

interface RoadmapCardProps {
  roadmap: Roadmap;
  onOpen: () => void;
  onDelete: () => void;
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export function RoadmapCard({ roadmap, onOpen, onDelete }: RoadmapCardProps) {
  const colors = useThemeColors();
  const progress = computeProgress(roadmap);
  const subtopicCount = countSubtopics(roadmap);
  const next = nextMainPoint(roadmap);
  const nextLine =
    roadmap.mainPoints.length === 0
      ? "No main points yet"
      : next
        ? `Next up: ${next.title}`
        : "All main points done";

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.topRow}>
        <View style={[styles.iconTile, { backgroundColor: colors.tone.emerald.bg, borderColor: colors.tone.emerald.border }]}>
          <MapPinned size={20} color={colors.tone.emerald.fg} />
        </View>
        <IconButton icon={Trash2} label={`Delete ${roadmap.subject}`} onPress={onDelete} />
      </View>

      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`Open ${roadmap.subject}`}
        style={({ pressed }) => [styles.body, pressed && { opacity: 0.85 }]}
      >
        <Text style={[styles.subject, { color: colors.foreground }]}>{roadmap.subject}</Text>
        <Text style={[styles.levels, { color: colors.mutedForeground }]}>
          {roadmap.startLevel} → {roadmap.targetLevel}
        </Text>
        <Text style={[styles.counts, { color: colors.mutedForeground }]}>
          {plural(roadmap.mainPoints.length, "main point")} · {plural(subtopicCount, "subpoint")}
        </Text>
        <ProgressBar {...progress} />
        <Text style={[styles.next, { color: colors.foreground }]} numberOfLines={1}>
          {nextLine}
        </Text>
        <View style={styles.openRow}>
          <Text style={[styles.openText, { color: colors.primary }]}>Open roadmap</Text>
          <ArrowRight size={16} color={colors.primary} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    gap: spacing.sm,
  },
  subject: {
    fontSize: 18,
    fontWeight: "600",
  },
  levels: {
    fontSize: 14,
  },
  counts: {
    fontSize: 13,
  },
  next: {
    fontSize: 14,
    fontWeight: "500",
  },
  openRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  openText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
