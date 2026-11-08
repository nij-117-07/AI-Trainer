// src/features/dashboard/components/HubCard.tsx
import { StyleSheet, Text, View } from "react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import type { HubConfig } from "../data/hubs";

interface HubCardProps {
  hub: HubConfig;
  width: `${number}%`;
}

export function HubCard({ hub, width }: HubCardProps) {
  const colors = useThemeColors();
  const tone = colors.tone[hub.tone];
  const Icon = hub.icon;

  return (
    <View
      accessibilityRole="summary"
      accessibilityLabel={`${hub.title} hub, coming soon`}
      style={[styles.card, { width, backgroundColor: tone.bg, borderColor: tone.border }]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconTile, { backgroundColor: colors.card, borderColor: tone.border }]}>
          <Icon size={20} color={tone.fg} />
        </View>
        <Text style={[styles.tagline, { color: colors.mutedForeground }]}>{hub.tagline}</Text>
      </View>

      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.foreground }]}>{hub.title}</Text>
        <Text style={[styles.description, { color: colors.mutedForeground }]}>{hub.description}</Text>
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>Coming soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius["2xl"],
    padding: spacing.xl,
    gap: spacing.lg,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tagline: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  body: {
    gap: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
  },
  footerText: {
    fontSize: 14,
  },
});
