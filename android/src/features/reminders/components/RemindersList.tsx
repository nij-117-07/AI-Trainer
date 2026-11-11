/** Reminders body: the list of reminders, or an empty hint. The add form lives in the footer. */
import { StyleSheet, Text } from "react-native";
import { Bell } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { CardGrid } from "@/components/tool/CardGrid";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import type { ReminderStore } from "../hooks/useReminders";
import { ReminderCard } from "./ReminderCard";

export function RemindersList({ store }: { store: ReminderStore }) {
  const colors = useThemeColors();
  if (!store.loaded) {
    return (
      <Text accessibilityLiveRegion="polite" style={[styles.note, { color: colors.mutedForeground }]}>
        Loading reminders…
      </Text>
    );
  }
  const now = new Date();

  return (
    <Section>
      {store.reminders.length > 0 && !store.notificationsOn && (
        <Text accessibilityLiveRegion="polite" style={[styles.note, { color: colors.destructive }]}>
          Notifications are turned off for this app. Turn them on in phone settings so reminders can fire.
        </Text>
      )}
      {store.reminders.length === 0 ? (
        <EmptyHint icon={Bell} title="No reminders yet" hint={'Tap New reminder to add one. For example, "Drink water" every 2 hours.'} />
      ) : (
        <CardGrid>
          {store.reminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              now={now}
              onToggle={() => store.toggleReminder(reminder.id)}
              onDelete={() => store.removeReminder(reminder.id)}
            />
          ))}
        </CardGrid>
      )}

      <Text style={[styles.note, { color: colors.mutedForeground }]}>
        Reminders are sent by the phone, so they still arrive when the app is closed. Upcoming times are scheduled for the
        next week. Open the app at least once a week to refresh them.
      </Text>
    </Section>
  );
}

const styles = StyleSheet.create({
  note: {
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: spacing.xs,
  },
});
