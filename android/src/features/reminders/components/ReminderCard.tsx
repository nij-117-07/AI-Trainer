/** One reminder: its name, schedule, next time, an On/Off switch, and delete (which asks first). */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Bell, Trash2 } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
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
    <Panel>
      <View style={styles.header}>
        <Bell size={18} color={reminder.enabled ? colors.primary : colors.mutedForeground} />
        <Text style={[styles.title, { color: colors.foreground }]}>{reminder.name}</Text>
        <Pressable
          onPress={onToggle}
          accessibilityRole="switch"
          accessibilityState={{ checked: reminder.enabled }}
          accessibilityLabel={`Reminder ${reminder.name}`}
          style={[
            styles.pill,
            reminder.enabled
              ? { backgroundColor: colors.primary, borderColor: colors.primary }
              : { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.pillText, { color: reminder.enabled ? colors.primaryForeground : colors.mutedForeground }]}>
            {reminder.enabled ? "On" : "Off"}
          </Text>
        </Pressable>
        <Pressable onPress={confirmDelete} accessibilityRole="button" accessibilityLabel={`Delete ${reminder.name}`} style={styles.deleteButton}>
          <Trash2 size={18} color={colors.destructive} />
        </Pressable>
      </View>
      <Text style={[styles.muted, { color: colors.mutedForeground }]}>{describeReminder(reminder)}</Text>
      <Text
        accessibilityLiveRegion="polite"
        style={[styles.status, { color: reminder.enabled ? colors.foreground : colors.mutedForeground }]}
      >
        {describeNext(reminder, now)}
      </Text>
    </Panel>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
  },
  pill: {
    minHeight: 44,
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
  },
  deleteButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
  },
  muted: {
    fontSize: 13,
    lineHeight: 18,
  },
  status: {
    fontSize: 14,
    lineHeight: 21,
  },
});
