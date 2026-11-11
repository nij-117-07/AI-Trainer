// src/features/tutor-chat/components/ReplyConcepts.tsx
/** Key concepts for one tutor reply. Collapsed by default, with the concept names as the summary. */
import { StyleSheet, Text, View } from "react-native";
import { Lightbulb } from "lucide-react-native";
import { spacing, typeScale, useThemeColors } from "@/theme";
import { Disclosure } from "@/components/tool/Disclosure";
import { ListenButton } from "@/components/tool/ListenButton";
import type { ConceptItem } from "../lib/types";

export function ReplyConcepts({ items }: { items: ConceptItem[] }) {
  const colors = useThemeColors();

  if (items.length === 0) return null;

  const spoken = items.map((item) => [item.title, item.description].filter(Boolean).join(". ")).join(". ");

  return (
    <Disclosure
      title={`Key concepts (${items.length})`}
      icon={Lightbulb}
      summary={items.map((item) => item.title).join(", ")}
    >
      {items.map((item, index) => (
        <View key={`${item.title}-${index}`} style={styles.item}>
          <Text style={[styles.title, { color: colors.foreground }]}>{item.title}</Text>
          {item.description ? (
            <Text style={[styles.description, { color: colors.mutedForeground }]}>{item.description}</Text>
          ) : null}
        </View>
      ))}
      <ListenButton text={spoken} label="Key concepts" />
    </Disclosure>
  );
}

const styles = StyleSheet.create({
  item: {
    gap: spacing.xs,
  },
  title: {
    ...typeScale.label,
    fontWeight: "600",
  },
  description: {
    ...typeScale.body,
  },
});
