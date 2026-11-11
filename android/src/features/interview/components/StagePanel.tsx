// src/features/interview/components/StagePanel.tsx
/**
 * Shared frame for each interview stage: title, pending row, body and secondary actions. Also the
 * small pieces every stage uses: icon-only actions, inline reveals, badges, and lists.
 */
import { useState, type ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronDown, ChevronUp, type LucideIcon } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors, type Tone } from "@/theme";
import { Panel, pointerCursor } from "@/components/tool/FormControls";

interface StagePanelProps {
  label: string;
  hint?: string;
  isPending?: boolean;
  pendingLabel?: string;
  trailing?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}

export function StagePanel({
  label,
  hint,
  isPending = false,
  pendingLabel,
  trailing,
  actions,
  children,
}: StagePanelProps) {
  const colors = useThemeColors();
  return (
    <Panel>
      <View style={styles.titleRow}>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.foreground }]}>
          {label}
        </Text>
        {trailing}
      </View>
      {hint ? <Text style={[styles.hint, { color: colors.mutedForeground }]}>{hint}</Text> : null}
      {isPending ? (
        <View
          accessibilityLiveRegion="polite"
          style={[styles.pending, { backgroundColor: colors.muted, borderColor: colors.border }]}
        >
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>{pendingLabel ?? "Working…"}</Text>
        </View>
      ) : null}
      {children}
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </Panel>
  );
}

interface IconActionProps {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

/** Icon-only action with a spoken name. The label names the action and the object. */
export function IconAction({ icon: Icon, label, onPress, disabled = false }: IconActionProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.iconAction,
        pointerCursor,
        pressed && { backgroundColor: colors.muted },
        disabled && styles.disabled,
      ]}
    >
      <Icon size={22} color={colors.foreground} />
    </Pressable>
  );
}

interface RevealProps {
  title: string;
  summary?: string;
  /** Forces the body open, for example while the user is editing what it holds. */
  open?: boolean;
  children: ReactNode;
}

/** Inline section that starts closed. The header keeps a one-line summary so the closed state still says what is inside. */
export function Reveal({ title, summary, open = false, children }: RevealProps) {
  const colors = useThemeColors();
  const [expanded, setExpanded] = useState(false);
  const shown = open || expanded;
  const Chevron = shown ? ChevronUp : ChevronDown;

  return (
    <View style={[styles.reveal, { borderTopColor: colors.border }]}>
      <Pressable
        onPress={() => setExpanded(!expanded)}
        disabled={open}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded: shown, disabled: open }}
        style={({ pressed }) => [styles.revealHeader, pointerCursor, pressed && { backgroundColor: colors.muted }]}
      >
        <View style={styles.revealText}>
          <Text style={[styles.revealTitle, { color: colors.foreground }]}>{title}</Text>
          {summary ? (
            <Text numberOfLines={1} style={[styles.revealSummary, { color: colors.mutedForeground }]}>
              {summary}
            </Text>
          ) : null}
        </View>
        <Chevron size={20} color={colors.mutedForeground} />
      </Pressable>
      {shown ? <View style={styles.revealBody}>{children}</View> : null}
    </View>
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

interface BulletListProps {
  items: string[];
  /** Icon drawn before each item, for example a check for strengths. The words still carry the meaning. */
  icon?: LucideIcon;
  tone?: Tone;
}

export function BulletList({ items, icon: Icon, tone }: BulletListProps) {
  const colors = useThemeColors();
  if (items.length === 0) return null;
  const iconColor = tone ? colors.tone[tone].fg : colors.foreground;
  return (
    <View style={styles.bullets}>
      {items.map((item, index) =>
        Icon ? (
          <View key={`${index}-${item}`} style={styles.bulletRow}>
            <View style={styles.bulletIcon}>
              <Icon size={16} color={iconColor} />
            </View>
            <Text style={[styles.bullet, { color: colors.foreground }]}>{item}</Text>
          </View>
        ) : (
          <Text key={`${index}-${item}`} style={[styles.bullet, { color: colors.foreground }]}>
            • {item}
          </Text>
        ),
      )}
    </View>
  );
}

/** Heading and list together. Renders nothing when there are no items, so no empty heading shows. */
export function ListBlock({
  title,
  items,
  icon,
  tone,
}: {
  title: string;
  items: string[];
  icon?: LucideIcon;
  tone?: Tone;
}) {
  if (items.length === 0) return null;
  return (
    <View style={styles.block}>
      <SubHeading>{title}</SubHeading>
      <BulletList items={items} icon={icon} tone={tone} />
    </View>
  );
}

export function SubHeading({ children }: { children: string }) {
  const colors = useThemeColors();
  return (
    <Text accessibilityRole="header" style={[styles.subheading, { color: colors.foreground }]}>
      {children}
    </Text>
  );
}

export function EmptyNote({ children }: { children: string }) {
  const colors = useThemeColors();
  return <Text style={[styles.hint, { color: colors.mutedForeground }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  title: {
    ...typeScale.title,
    flexShrink: 1,
  },
  hint: {
    ...typeScale.body,
  },
  pending: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: spacing.md,
  },
  actions: {
    gap: spacing.sm,
  },
  iconAction: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.5,
  },
  reveal: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
  },
  revealHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: touchTarget,
    borderRadius: shape.md,
  },
  revealText: {
    flex: 1,
    gap: spacing.xs,
  },
  revealTitle: {
    ...typeScale.body,
    fontWeight: "600",
  },
  revealSummary: {
    ...typeScale.caption,
  },
  revealBody: {
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  badge: {
    borderWidth: 1,
    borderRadius: shape.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    ...typeScale.caption,
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
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  bulletIcon: {
    height: typeScale.body.lineHeight,
    justifyContent: "center",
  },
  bullet: {
    ...typeScale.body,
    flex: 1,
  },
  block: {
    gap: spacing.xs,
  },
  subheading: {
    ...typeScale.body,
    fontWeight: "600",
  },
});
