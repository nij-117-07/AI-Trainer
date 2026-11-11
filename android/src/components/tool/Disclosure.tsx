// src/components/tool/Disclosure.tsx
/**
 * A panel whose body can be shown or hidden. The header shows the title, an optional one-line
 * summary, and a chevron, so a closed section still says what is inside. Starts closed unless
 * defaultOpen is set.
 */
import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronDown, ChevronUp, type LucideIcon } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { Panel } from "./FormControls";

interface DisclosureProps {
  title: string;
  icon?: LucideIcon;
  summary?: string;
  defaultOpen?: boolean;
  /** Set to control the open state from the parent, for example to open it when a field has an error. */
  open?: boolean;
  onToggle?: (open: boolean) => void;
  children: ReactNode;
}

export function Disclosure({ title, icon: Icon, summary, defaultOpen = false, open: controlled, onToggle, children }: DisclosureProps) {
  const colors = useThemeColors();
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const open = controlled ?? uncontrolled;
  const Chevron = open ? ChevronUp : ChevronDown;

  return (
    <Panel>
      <Pressable
        onPress={() => {
          setUncontrolled(!open);
          onToggle?.(!open);
        }}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded: open }}
        style={({ pressed }) => [styles.header, pressed && { backgroundColor: colors.muted }]}
      >
        <View style={styles.titleBlock}>
          <View style={styles.titleRow}>
            {Icon && <Icon size={16} color={colors.primary} />}
            <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
          </View>
          {summary ? (
            <Text numberOfLines={2} style={[styles.summary, { color: colors.mutedForeground }]}>
              {summary}
            </Text>
          ) : null}
        </View>
        <Chevron size={18} color={colors.mutedForeground} />
      </Pressable>
      {open && <View style={styles.body}>{children}</View>}
    </Panel>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  titleBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  summary: {
    fontSize: 13,
    lineHeight: 19,
  },
  body: {
    gap: spacing.lg,
  },
});
