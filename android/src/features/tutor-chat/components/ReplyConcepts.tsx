// src/features/tutor-chat/components/ReplyConcepts.tsx
/** Key concepts for one tutor reply. Collapsed by default so the conversation stays easy to scan. */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ListenButton } from "@/components/tool/ListenButton";
import type { ConceptItem } from "../lib/types";

export function ReplyConcepts({ items }: { items: ConceptItem[] }) {
  const colors = useThemeColors();
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  const spoken = items.map((item) => [item.title, item.description].filter(Boolean).join(". ")).join(". ");

  return (
    <View style={[styles.box, { borderColor: colors.border }]}>
      <Pressable
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${open ? "Hide" : "Show"} key concepts`}
        style={styles.toggle}
      >
        <Text style={[styles.toggleText, { color: colors.foreground }]}>Key concepts ({items.length})</Text>
        {open ? (
          <ChevronUp size={18} color={colors.mutedForeground} />
        ) : (
          <ChevronDown size={18} color={colors.mutedForeground} />
        )}
      </Pressable>

      {open ? (
        <View style={[styles.list, { borderTopColor: colors.border }]}>
          {items.map((item, index) => (
            <View key={`${item.title}-${index}`} style={styles.item}>
              <Text style={[styles.title, { color: colors.foreground }]}>{item.title}</Text>
              {item.description ? (
                <Text style={[styles.description, { color: colors.mutedForeground }]}>{item.description}</Text>
              ) : null}
            </View>
          ))}
          <ListenButton text={spoken} label="Key concepts" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
  },
  list: {
    borderTopWidth: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  item: {
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
