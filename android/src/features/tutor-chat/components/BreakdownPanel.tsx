// src/features/tutor-chat/components/BreakdownPanel.tsx
/** Concept breakdown for the selected tutor reply, with previous and next controls to browse replies. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BookOpenCheck, ChevronLeft, ChevronRight } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { ConceptItem } from "../lib/types";

interface BreakdownPanelProps {
  items: ConceptItem[];
  index: number;
  count: number;
  onNavigate: (index: number) => void;
}

export function BreakdownPanel({ items, index, count, onNavigate }: BreakdownPanelProps) {
  const colors = useThemeColors();
  const isFirst = index <= 0;
  const isLast = index >= count - 1;

  return (
    <Panel>
      <SectionTitle icon={BookOpenCheck} title="Educational breakdown" />

      {count === 0 ? (
        <Text style={[styles.muted, { color: colors.mutedForeground }]}>
          Concept breakdowns for each tutor reply will appear here.
        </Text>
      ) : (
        <>
          <View style={styles.nav}>
            <Pressable
              onPress={() => onNavigate(index - 1)}
              disabled={isFirst}
              accessibilityRole="button"
              accessibilityLabel="Previous breakdown"
              style={[styles.navButton, { borderColor: colors.border, opacity: isFirst ? 0.4 : 1 }]}
            >
              <ChevronLeft size={18} color={colors.foreground} />
            </Pressable>
            <Text style={[styles.muted, { color: colors.mutedForeground }]}>
              Reply {index + 1} of {count}
            </Text>
            <Pressable
              onPress={() => onNavigate(index + 1)}
              disabled={isLast}
              accessibilityRole="button"
              accessibilityLabel="Next breakdown"
              style={[styles.navButton, { borderColor: colors.border, opacity: isLast ? 0.4 : 1 }]}
            >
              <ChevronRight size={18} color={colors.foreground} />
            </Pressable>
          </View>

          {items.length === 0 ? (
            <Text style={[styles.muted, { color: colors.mutedForeground }]}>
              No concept breakdown for this reply.
            </Text>
          ) : (
            items.map((item, position) => (
              <View key={`${item.title}-${position}`} style={[styles.item, { borderTopColor: colors.border }]}>
                <Text style={[styles.title, { color: colors.foreground }]}>{item.title}</Text>
                {item.description ? (
                  <Text style={[styles.description, { color: colors.mutedForeground }]}>{item.description}</Text>
                ) : null}
              </View>
            ))
          )}
          {items.length > 0 ? (
            <ListenButton
              text={items.map((item) => [item.title, item.description].filter(Boolean).join(". ")).join(". ")}
              label="Breakdown"
            />
          ) : null}
        </>
      )}
    </Panel>
  );
}

const styles = StyleSheet.create({
  muted: {
    fontSize: 14,
    lineHeight: 21,
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  item: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
    gap: spacing.xs,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
  },
});
