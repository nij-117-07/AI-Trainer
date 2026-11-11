// src/features/dashboard/components/HubCard.tsx
/**
 * Area card for the dashboard grid. The whole card is the touch target. A featured card uses a tinted
 * fill and shows its full description, so it reads as the first thing to open.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import type { HubItem } from "@/components/tool/HubMenu";
import { pointerCursor } from "@/components/tool/FormControls";
import { cardPadding, shape, spacing, touchTarget, typeScale, useLayout, useThemeColors } from "@/theme";

interface HubCardProps {
  hub: HubItem;
  width: `${number}%`;
  featured?: boolean;
  onPress: () => void;
}

export function HubCard({ hub, width, featured = false, onPress }: HubCardProps) {
  const colors = useThemeColors();
  const { size } = useLayout();
  const tone = colors.tone[hub.tone];
  const Icon = hub.icon;
  const padding = size === "phone" ? cardPadding.compact : cardPadding.medium;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${hub.title}`}
      accessibilityHint={hub.description}
      style={({ pressed }) => [
        styles.card,
        pointerCursor,
        { width, padding, backgroundColor: featured ? tone.bg : colors.card, borderColor: featured ? tone.border : colors.border },
        pressed && { backgroundColor: colors.muted },
      ]}
    >
      <View style={[styles.iconTile, { backgroundColor: colors.card, borderColor: tone.border }]}>
        <Icon size={24} color={tone.fg} />
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.foreground }]}>{hub.title}</Text>
        <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={featured ? undefined : 2}>
          {hub.description}
        </Text>
      </View>
      <ChevronRight size={20} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    minHeight: touchTarget,
    borderWidth: 1,
    borderRadius: shape.lg,
  },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: shape.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typeScale.title,
  },
  description: {
    ...typeScale.body,
  },
});
