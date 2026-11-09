/** Habit Tracker: tick today's habits, or open the dashboard for streaks and history. */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check, Plus, Trash2 } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ChoiceChips, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { dateKey } from "@/features/tasks/lib/dates";
import { useHabits } from "../hooks/useHabits";
import { completionRate, currentStreak, isDone, lastDays, MAX_HABITS, NAME_MAX } from "../lib/habits";
import type { Habit, HabitView } from "../types";

const VIEW_OPTIONS: { value: HabitView; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "dashboard", label: "Dashboard" },
];

const HISTORY_DAYS = 14;
const RATE_DAYS = 30;

export function HabitTracker() {
  const store = useHabits();
  const [view, setView] = useState<HabitView>("today");
  const today = dateKey(new Date());

  return (
    <Section>
      <ChoiceChips options={VIEW_OPTIONS} value={view} onChange={setView} wrap={false} />
      {view === "today" ? (
        <TodayView store={store} today={today} />
      ) : (
        <DashboardView store={store} today={today} />
      )}
    </Section>
  );
}

type HabitStore = ReturnType<typeof useHabits>;

function TodayView({ store, today }: { store: HabitStore; today: string }) {
  const colors = useThemeColors();
  const doneToday = store.habits.filter((habit) => isDone(store.completions, today, habit.id)).length;
  const full = store.habits.length >= MAX_HABITS;

  return (
    <>
      <Panel>
        <Text style={[styles.bigNumber, { color: colors.foreground }]}>
          {doneToday} / {store.habits.length}
        </Text>
        <Text style={[styles.muted, { color: colors.mutedForeground }]}>
          {store.habits.length === 0 ? "Add a habit below to get started." : "habits done today"}
        </Text>
      </Panel>

      {store.habits.map((habit) => (
        <HabitRow key={habit.id} habit={habit} store={store} today={today} />
      ))}

      <AddHabitForm store={store} disabled={full} />
    </>
  );
}

function HabitRow({ habit, store, today }: { habit: Habit; store: HabitStore; today: string }) {
  const colors = useThemeColors();
  const done = isDone(store.completions, today, habit.id);
  const streak = currentStreak(store.completions, habit.id, today);

  return (
    <Pressable
      onPress={() => store.toggleDay(habit.id, today)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={habit.name}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.card, borderColor: done ? colors.primary : colors.border },
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={[styles.tick, { borderColor: done ? colors.primary : colors.border, backgroundColor: done ? colors.primary : colors.background }]}>
        {done && <Check size={16} color={colors.primaryForeground} />}
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.habitName, { color: colors.foreground }, done && styles.struck]}>{habit.name}</Text>
        <Text style={[styles.muted, { color: colors.mutedForeground }]}>
          {streak > 0 ? `${streak} day streak` : "No streak yet"}
        </Text>
      </View>
    </Pressable>
  );
}

function AddHabitForm({ store, disabled }: { store: HabitStore; disabled: boolean }) {
  const [name, setName] = useState("");
  const canAdd = name.trim().length > 0 && !disabled;

  function add() {
    if (!canAdd) return;
    store.addHabit(name.trim().slice(0, NAME_MAX));
    setName("");
  }

  return (
    <Panel>
      <TextField
        label="New habit"
        placeholder="e.g. Drink water"
        value={name}
        onChangeText={setName}
        maxLength={NAME_MAX}
        onSubmitEditing={add}
        editable={!disabled}
      />
      <ActionButton label={disabled ? `Limit of ${MAX_HABITS} habits reached` : "Add habit"} icon={Plus} onPress={add} disabled={!canAdd} />
    </Panel>
  );
}

function DashboardView({ store, today }: { store: HabitStore; today: string }) {
  const colors = useThemeColors();
  const days = lastDays(today, HISTORY_DAYS);
  const doneToday = store.habits.filter((habit) => isDone(store.completions, today, habit.id)).length;
  const bestStreak = store.habits.reduce(
    (best, habit) => Math.max(best, currentStreak(store.completions, habit.id, today)),
    0,
  );
  const averageRate =
    store.habits.length === 0
      ? 0
      : Math.round(
          store.habits.reduce((sum, habit) => sum + completionRate(store.completions, habit.id, today, RATE_DAYS), 0) /
            store.habits.length,
        );

  return (
    <>
      <View style={styles.statRow}>
        <StatCard label="Today" value={`${doneToday}/${store.habits.length}`} />
        <StatCard label="Best streak" value={`${bestStreak}d`} />
        <StatCard label={`${RATE_DAYS}-day rate`} value={`${averageRate}%`} />
      </View>

      <SectionTitle icon={Check} title="Last 14 days" />
      {store.habits.length === 0 ? (
        <Text style={[styles.empty, { color: colors.mutedForeground }]}>No habits yet. Add some on the Today tab.</Text>
      ) : (
        store.habits.map((habit) => {
          const rate = completionRate(store.completions, habit.id, today, RATE_DAYS);
          return (
            <Panel key={habit.id}>
              <View style={styles.dashHeader}>
                <Text style={[styles.habitName, { color: colors.foreground, flex: 1 }]} numberOfLines={1}>
                  {habit.name}
                </Text>
                <Text style={[styles.muted, { color: colors.mutedForeground }]}>{rate}%</Text>
                <Pressable
                  onPress={() => store.removeOne(habit.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${habit.name}`}
                  hitSlop={8}
                >
                  <Trash2 size={18} color={colors.destructive} />
                </Pressable>
              </View>
              <View style={styles.grid}>
                {days.map((day) => (
                  <View
                    key={day}
                    style={[
                      styles.cell,
                      { backgroundColor: isDone(store.completions, day, habit.id) ? colors.primary : colors.muted },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.muted, { color: colors.mutedForeground }]}>
                Streak: {currentStreak(store.completions, habit.id, today)} days
              </Text>
            </Panel>
          );
        })
      )}
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.stat, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.muted, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bigNumber: { fontSize: 30, fontWeight: "700", letterSpacing: -0.5 },
  muted: { fontSize: 13, lineHeight: 18 },
  empty: { fontSize: 14, textAlign: "center", paddingVertical: spacing.md },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg },
  tick: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  rowText: { flex: 1, gap: 2 },
  habitName: { fontSize: 16, fontWeight: "600" },
  struck: { opacity: 0.6 },
  statRow: { flexDirection: "row", gap: spacing.sm },
  stat: { flex: 1, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, gap: 2, alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "700" },
  dashHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  cell: { width: 18, height: 18, borderRadius: 4 },
});
