/** Habit Tracker: tick today's habits, or open the dashboard for streaks and history. */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check, Circle, CircleCheck, Plus, Trash2 } from "lucide-react-native";
import { cardPadding, shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { ActionButton, ChoiceChips, Panel, TextField } from "@/components/tool/FormControls";
import { CardGrid } from "@/components/tool/CardGrid";
import { EmptyHint } from "@/components/tool/EmptyHint";
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

  if (!store.loaded) {
    return <LoadingHabits />;
  }

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

function LoadingHabits() {
  const colors = useThemeColors();
  return <Text style={[typeScale.body, styles.empty, { color: colors.mutedForeground }]}>Loading habits…</Text>;
}

type HabitStore = ReturnType<typeof useHabits>;

function TodayView({ store, today }: { store: HabitStore; today: string }) {
  const colors = useThemeColors();
  const doneToday = store.habits.filter((habit) => isDone(store.completions, today, habit.id)).length;
  const full = store.habits.length >= MAX_HABITS;
  const allDone = store.habits.length > 0 && doneToday === store.habits.length;

  return (
    <>
      <View style={styles.summary}>
        <Text
          accessibilityLiveRegion="polite"
          accessibilityLabel={`${doneToday} of ${store.habits.length} habits done today`}
          style={[typeScale.headline, { color: colors.foreground }]}
        >
          {doneToday} / {store.habits.length}
        </Text>
        <Text style={[typeScale.caption, { color: colors.mutedForeground }]}>
          {store.habits.length === 0 ? "No habits yet" : allDone ? "All done today" : "done today"}
        </Text>
      </View>

      <AddHabitForm store={store} disabled={full} />

      {store.habits.length > 0 ? (
        <CardGrid>
          {store.habits.map((habit) => (
            <HabitRow key={habit.id} habit={habit} store={store} today={today} />
          ))}
        </CardGrid>
      ) : null}
    </>
  );
}

function HabitRow({ habit, store, today }: { habit: Habit; store: HabitStore; today: string }) {
  const colors = useThemeColors();
  const done = isDone(store.completions, today, habit.id);
  const streak = currentStreak(store.completions, habit.id, today);

  return (
    <View style={[styles.row, { backgroundColor: colors.card, borderColor: done ? colors.primary : colors.border }]}>
      <View style={styles.rowText}>
        <Text numberOfLines={1} style={[typeScale.body, styles.habitName, { color: colors.foreground }, done && styles.struck]}>
          {habit.name}
        </Text>
        <Text style={[typeScale.caption, { color: colors.mutedForeground }]}>
          {streak > 0 ? `${streak} day streak` : "No streak yet"}
        </Text>
      </View>
      <Pressable
        onPress={() => store.toggleDay(habit.id, today)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={done ? `Mark ${habit.name} not done` : `Mark ${habit.name} done`}
        style={({ pressed }) => [styles.iconButton, pressed && { backgroundColor: colors.muted }]}
      >
        {done ? <CircleCheck size={24} color={colors.primary} /> : <Circle size={24} color={colors.mutedForeground} />}
      </Pressable>
    </View>
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
        style={styles.input}
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
        <StatCard label="Best streak" value={`${bestStreak} days`} />
        <StatCard label={`${RATE_DAYS}-day rate`} value={`${averageRate}%`} />
      </View>

      <SectionTitle icon={Check} title={`Last ${HISTORY_DAYS} days`} />
      {store.habits.length === 0 ? (
        <EmptyHint icon={Check} title="No habits yet" hint="Add a habit on the Today tab to see streaks here." />
      ) : (
        <CardGrid>
          {store.habits.map((habit) => {
            const rate = completionRate(store.completions, habit.id, today, RATE_DAYS);
            const streak = currentStreak(store.completions, habit.id, today);
            const doneDays = days.filter((day) => isDone(store.completions, day, habit.id)).length;
            return (
              <View key={habit.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.dashHeader}>
                  <Text numberOfLines={1} style={[typeScale.body, styles.habitName, { color: colors.foreground, flex: 1 }]}>
                    {habit.name}
                  </Text>
                  <Text
                    accessibilityLabel={`${rate} percent done in the last ${RATE_DAYS} days`}
                    style={[typeScale.caption, { color: colors.mutedForeground }]}
                  >
                    {rate}%
                  </Text>
                  <Pressable
                    onPress={() => store.removeOne(habit.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${habit.name}`}
                    style={({ pressed }) => [styles.iconButton, pressed && { backgroundColor: colors.muted }]}
                  >
                    <Trash2 size={20} color={colors.destructive} />
                  </Pressable>
                </View>
                <View accessible accessibilityLabel={`${doneDays} of ${HISTORY_DAYS} days done`} style={styles.grid}>
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
                <Text style={[typeScale.caption, { color: colors.mutedForeground }]}>
                  Streak: {streak} {streak === 1 ? "day" : "days"}
                </Text>
              </View>
            );
          })}
        </CardGrid>
      )}
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.stat, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[typeScale.headline, { color: colors.foreground }]}>{value}</Text>
      <Text style={[typeScale.caption, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { gap: spacing.xs },
  empty: { textAlign: "center", paddingVertical: spacing.md },
  input: { minHeight: 56 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: shape.lg,
    paddingLeft: cardPadding.compact,
    paddingRight: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: 56,
  },
  rowText: { flex: 1, gap: spacing.xs },
  habitName: { fontWeight: "600" },
  struck: { opacity: 0.6 },
  iconButton: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
  statRow: { flexDirection: "row", gap: spacing.sm },
  stat: {
    flex: 1,
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: spacing.md,
    gap: spacing.xs,
    alignItems: "center",
  },
  card: {
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: cardPadding.compact,
    gap: spacing.md,
  },
  dashHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  cell: { width: 16, height: 16, borderRadius: shape.xs },
});
