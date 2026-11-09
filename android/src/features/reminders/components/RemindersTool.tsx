/** Reminders: repeat every few minutes, hours, or days, within an active time window and on chosen weekdays. */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Bell, Plus, Trash2 } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ChoiceChips, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { requestReminderPermission } from "@/features/tasks/lib/notifications";
import { useReminders } from "../hooks/useReminders";
import { formatClock, nextOccurrence } from "../lib/schedule";
import { MAX_REMINDERS, NAME_MAX, UNIT_LIMITS, validateReminderInput, type ReminderInput } from "../lib/validate";
import type { Reminder, ReminderUnit } from "../types";

const UNIT_OPTIONS: { value: ReminderUnit; label: string }[] = [
  { value: "minutes", label: "Minutes" },
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" },
];

/** Monday first, matching how people plan their week. */
const WEEKDAY_ORDER: { value: number; label: string }[] = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_ALL = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAYS_WORK = [1, 2, 3, 4, 5];

function describeDays(weekdays: number[]): string {
  if (weekdays.length === 7) return "Every day";
  if (weekdays.length === 5 && WEEKDAYS_WORK.every((day) => weekdays.includes(day))) return "Mon–Fri";
  return [...WEEKDAY_ORDER].filter((day) => weekdays.includes(day.value)).map((day) => day.label).join(", ");
}

function describeReminder(reminder: Reminder): string {
  const unit = reminder.every === 1 ? reminder.unit.replace(/s$/, "") : reminder.unit;
  return `Every ${reminder.every} ${unit} · ${reminder.windowStart}–${reminder.windowEnd} · ${describeDays(reminder.weekdays)}`;
}

function describeNext(reminder: Reminder, now: Date): string {
  if (!reminder.enabled) return "Paused";
  const next = nextOccurrence(reminder, now);
  if (!next) return "No upcoming times in the next week";
  return `Next: ${WEEKDAY_SHORT[next.getDay()]} ${formatClock(next.getHours() * 60 + next.getMinutes())}`;
}

export function RemindersTool() {
  const store = useReminders();
  const colors = useThemeColors();
  const [name, setName] = useState("");
  const [every, setEvery] = useState("2");
  const [unit, setUnit] = useState<ReminderUnit>("hours");
  const [windowStart, setWindowStart] = useState("09:00");
  const [windowEnd, setWindowEnd] = useState("21:00");
  const [weekdays, setWeekdays] = useState<number[]>(WEEKDAYS_ALL);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const full = store.reminders.length >= MAX_REMINDERS;

  function toggleDay(day: number) {
    setWeekdays((prev) => (prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day]));
  }

  async function add() {
    const input: ReminderInput = { name, every, unit, windowStart, windowEnd, weekdays };
    const check = validateReminderInput(input);
    if (!check.ok) {
      setNotice(null);
      setError(check.error);
      return;
    }
    setError(null);
    store.addReminder(check.value);
    setName("");
    const granted = await requestReminderPermission();
    setNotice(granted ? null : "Notifications are turned off for this app. Turn them on in phone settings so reminders can fire.");
  }

  const now = new Date();

  return (
    <Section>
      {store.reminders.length === 0 && (
        <Text style={[styles.empty, { color: colors.mutedForeground }]}>
          Add a reminder, for example "Drink water" every 2 hours between 09:00 and 21:00.
        </Text>
      )}

      {store.reminders.map((reminder) => (
        <Panel key={reminder.id}>
          <View style={styles.cardHeader}>
            <Bell size={18} color={reminder.enabled ? colors.primary : colors.mutedForeground} />
            <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={1}>
              {reminder.name}
            </Text>
            <Pressable
              onPress={() => store.toggleReminder(reminder.id)}
              accessibilityRole="switch"
              accessibilityState={{ checked: reminder.enabled }}
              accessibilityLabel={`${reminder.enabled ? "Pause" : "Resume"} ${reminder.name}`}
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
            <Pressable onPress={() => store.removeReminder(reminder.id)} accessibilityRole="button" accessibilityLabel={`Delete ${reminder.name}`} hitSlop={8}>
              <Trash2 size={18} color={colors.destructive} />
            </Pressable>
          </View>
          <Text style={[styles.muted, { color: colors.mutedForeground }]}>{describeReminder(reminder)}</Text>
          <Text style={[styles.muted, { color: colors.foreground }]}>{describeNext(reminder, now)}</Text>
        </Panel>
      ))}

      <SectionTitle icon={Plus} title="New reminder" />
      <Panel>
        <TextField label="What to remember" placeholder="e.g. Drink water" value={name} onChangeText={setName} maxLength={NAME_MAX} editable={!full} />
        <View style={styles.row}>
          <View style={styles.grow}>
            <TextField label="Repeat every" value={every} onChangeText={setEvery} keyboardType="number-pad" editable={!full} />
          </View>
        </View>
        <ChoiceChips options={UNIT_OPTIONS} value={unit} onChange={setUnit} wrap={false} />
        <Text style={[styles.muted, { color: colors.mutedForeground }]}>
          Allowed: {UNIT_LIMITS[unit].min} to {UNIT_LIMITS[unit].max} {unit}
        </Text>
        <View style={styles.row}>
          <View style={styles.grow}>
            <TextField label="Active from" placeholder="09:00" value={windowStart} onChangeText={setWindowStart} editable={!full} />
          </View>
          <View style={styles.grow}>
            <TextField label="Active until" placeholder="21:00" value={windowEnd} onChangeText={setWindowEnd} editable={!full} />
          </View>
        </View>
        <Text style={[styles.muted, { color: colors.mutedForeground }]}>
          Reminders only fire inside this window. A window like 22:00 to 06:00 is allowed.
        </Text>
        <View style={styles.days}>
          {WEEKDAY_ORDER.map((day) => {
            const selected = weekdays.includes(day.value);
            return (
              <Pressable
                key={day.value}
                onPress={() => toggleDay(day.value)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={day.label}
                disabled={full}
                style={[
                  styles.day,
                  { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primary : colors.card },
                ]}
              >
                <Text style={[styles.dayText, { color: selected ? colors.primaryForeground : colors.foreground }]}>{day.label}</Text>
              </Pressable>
            );
          })}
        </View>
        {error && <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>}
        {notice && <Text style={[styles.muted, { color: colors.destructive }]}>{notice}</Text>}
        <ActionButton label={full ? "Limit reached" : "Add reminder"} icon={Plus} onPress={add} disabled={full} />
      </Panel>

      <Text style={[styles.muted, { color: colors.mutedForeground }]}>
        Reminders are sent by the phone, so they still arrive when the app is closed. Upcoming times are scheduled
        for the next week. Open the app at least once a week to refresh them.
      </Text>
    </Section>
  );
}

const styles = StyleSheet.create({
  empty: { fontSize: 14, textAlign: "center", paddingVertical: spacing.md },
  error: { fontSize: 13 },
  muted: { fontSize: 13, lineHeight: 18 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  cardTitle: { flex: 1, fontSize: 17, fontWeight: "600" },
  pill: { borderWidth: 1, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 4 },
  pillText: { fontSize: 13, fontWeight: "600" },
  row: { flexDirection: "row", gap: spacing.sm },
  grow: { flex: 1 },
  days: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  day: { borderWidth: 1, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 6 },
  dayText: { fontSize: 13, fontWeight: "600" },
});
