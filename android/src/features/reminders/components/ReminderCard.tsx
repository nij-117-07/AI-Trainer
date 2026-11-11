/** One reminder: its name, schedule, next time, an On/Off switch, and delete (which asks first). */
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Trash2 } from "lucide-react-native";
import { cardPadding, shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { confirmAction } from "@/features/chatbot/lib/confirm";
import { describeNext, describeReminder } from "../lib/labels";
import type { Reminder } from "../types";

interface ReminderCardProps {
  reminder: Reminder;
  now: Date;
  onToggle: () => void;
  onDelete: () => void;
}

export function ReminderCard({ reminder, now, onToggle, onDelete }: ReminderCardProps) {
  const colors = useThemeColors();

  function confirmDelete() {
    confirmAction(`Delete ${reminder.name}?`, "Its upcoming reminders will be cancelled.", onDelete);
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.row}>
        <View style={styles.text}>
          <Text style={[styles.title, { color: colors.foreground }]}>{reminder.name}</Text>
          <Text style={[styles.body, { color: colors.mutedForeground }]}>{describeReminder(reminder)}</Text>
        </View>
        <Switch
          value={reminder.enabled}
          onValueChange={onToggle}
          accessibilityRole="switch"
          accessibilityLabel={`Reminder ${reminder.name}`}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.card}
        />
        <Pressable
          onPress={confirmDelete}
          accessibilityRole="button"
          accessibilityLabel={`Delete reminder ${reminder.name}`}
          style={({ pressed }) => [styles.deleteButton, pressed && { backgroundColor: colors.muted }]}
        >
          <Trash2 size={22} color={colors.destructive} />
        </Pressable>
      </View>
      <Text
        accessibilityLiveRegion="polite"
        style={[styles.body, styles.status, { color: reminder.enabled ? colors.foreground : colors.mutedForeground }]}
      >
        {describeNext(reminder, now)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: cardPadding.compact,
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typeScale.title,
  },
  body: {
    ...typeScale.body,
  },
  status: {
    fontWeight: "600",
  },
  deleteButton: {
    width: touchTarget,
    height: touchTarget,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: shape.full,
  },
});
