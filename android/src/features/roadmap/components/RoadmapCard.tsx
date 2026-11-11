// src/features/roadmap/components/RoadmapCard.tsx
/** One roadmap in the list: subject, a thin progress bar with the count, and a chevron. The whole row opens it. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { computeProgress } from "../lib/progress";
import type { Roadmap } from "../types";
import { ProgressBar } from "./ProgressBar";

interface RoadmapCardProps {
  roadmap: Roadmap;
  onOpen: () => void;
}

export function RoadmapCard({ roadmap, onOpen }: RoadmapCardProps) {
  const colors = useThemeColors();
  const progress = computeProgress(roadmap);

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`Open ${roadmap.subject}`}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { backgroundColor: colors.muted },
      ]}
    >
      <View style={styles.body}>
        <Text numberOfLines={1} style={[styles.subject, { color: colors.foreground }]}>
          {roadmap.subject}
        </Text>
        <ProgressBar {...progress} />
      </View>
      <ChevronRight size={20} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: shape.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  subject: {
    ...typeScale.title,
  },
});
