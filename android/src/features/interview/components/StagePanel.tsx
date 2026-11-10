// src/features/interview/components/StagePanel.tsx
/** Shared frame for each interview stage: title, pending row, body and secondary actions. */
import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { radius, spacing, useThemeColors, type Tone } from "@/theme";
import { Panel } from "@/components/tool/FormControls";

interface StagePanelProps {
  label: string;
  hint?: string;
  isPending?: boolean;
  pendingLabel?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export function StagePanel({
  label,
  hint,
  isPending = false,
  pendingLabel,
  actions,
  children,
}: StagePanelProps) {
  const colors = useThemeColors();
  return (
    <Panel>
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: colors.foreground }]}>{label}</Text>
      </View>
      {hint ? <Text style={[styles.hint, { color: colors.mutedForeground }]}>{hint}</Text> : null}
      {isPending ? (
        <View style={[styles.pending, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>{pendingLabel ?? "Working…"}</Text>
        </View>
      ) : null}
      {children}
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </Panel>
  );
}

interface StageBadgeProps {
  label: string;
  tone?: Tone;
}

export function StageBadge({ label, tone }: StageBadgeProps) {
  const colors = useThemeColors();
  const palette = tone ? colors.tone[tone] : null;
  return (
    <View
      style={[
        styles.badge,
        { borderColor: palette?.border ?? colors.border, backgroundColor: palette?.bg ?? colors.muted },
      ]}
    >
      <Text style={[styles.badgeText, { color: palette?.fg ?? colors.foreground }]}>{label}</Text>
    </View>
  );
}

export function BadgeRow({ children }: { children: ReactNode }) {
  return <View style={styles.badgeRow}>{children}</View>;
}

export function BulletList({ items }: { items: string[] }) {
  const colors = useThemeColors();
  if (items.length === 0) return null;
  return (
    <View style={styles.bullets}>
      {items.map((item, index) => (
        <Text key={`${index}-${item}`} style={[styles.bullet, { color: colors.foreground }]}>
          • {item}
        </Text>
      ))}
    </View>
  );
}

export function SubHeading({ children }: { children: string }) {
  const colors = useThemeColors();
  return <Text style={[styles.subheading, { color: colors.foreground }]}>{children}</Text>;
}

export function EmptyNote({ children }: { children: string }) {
  const colors = useThemeColors();
  return <Text style={[styles.hint, { color: colors.mutedForeground }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  title: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
  },
  pending: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  actions: {
    gap: spacing.sm,
  },
  badge: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  bullets: {
    gap: spacing.xs,
  },
  bullet: {
    fontSize: 14,
    lineHeight: 20,
  },
  subheading: {
    fontSize: 14,
    fontWeight: "600",
  },
});
