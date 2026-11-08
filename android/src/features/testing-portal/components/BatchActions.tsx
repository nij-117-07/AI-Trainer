// src/features/testing-portal/components/BatchActions.tsx
/** Count of generated items with "Generate more" (append) and "Reset" (clear everything). */
import { StyleSheet, Text, View } from "react-native";
import { Plus, RefreshCcw } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, Panel } from "./FormControls";

interface BatchActionsProps {
  count: number;
  noun: string;
  pending: boolean;
  onGenerateMore: () => void;
  onReset: () => void;
}

export function BatchActions({ count, noun, pending, onGenerateMore, onReset }: BatchActionsProps) {
  const colors = useThemeColors();
  return (
    <Panel>
      <Text style={[styles.count, { color: colors.foreground }]}>
        {count} {count === 1 ? noun : `${noun}s`}
      </Text>
      <View style={styles.actions}>
        <View style={styles.item}>
          <ActionButton label="Generate more" icon={Plus} loading={pending} onPress={onGenerateMore} />
        </View>
        <View style={styles.item}>
          <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={onReset} />
        </View>
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  count: {
    fontSize: 16,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  item: {
    flex: 1,
  },
});
