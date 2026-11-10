// src/features/counters/components/CounterAndCountdownFooter.tsx
/** Footer form for Counter & Countdown: the fields for the open tab, the error, and one primary add button. */
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Plus, Timer } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import type { CounterStore } from "../hooks/useCounterStore";
import { MAX_ITEMS, NAME_MAX, parseTarget } from "../lib/counters";
import { durationFromParts } from "../lib/timer";
import type { CounterTab } from "../types";

interface CounterAndCountdownFooterProps {
  store: CounterStore;
  tab: CounterTab;
}

export function CounterAndCountdownFooter({ store, tab }: CounterAndCountdownFooterProps) {
  return tab === "counter" ? <CounterForm store={store} /> : <CountdownForm store={store} />;
}

/** Caps the fields so a tall form scrolls inside the footer and the list above keeps room. */
const FIELDS_MAX_HEIGHT = 260;

function CounterForm({ store }: { store: CounterStore }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [error, setError] = useState<string | null>(null);
  const full = store.counters.length >= MAX_ITEMS;

  function add() {
    const parsed = parseTarget(target);
    if (name.trim() === "") return setError("Give the counter a name.");
    if (parsed === null) return setError("Target must be a whole number from 1 to 100000.");
    store.addCounter(name.trim().slice(0, NAME_MAX), parsed);
    setName("");
    setTarget("");
    setError(null);
  }

  return (
    <View style={styles.form}>
      <ScrollView style={styles.fields} contentContainerStyle={styles.fieldsContent} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
        <TextField
          label="Counter name"
          placeholder="e.g. Drink water"
          value={name}
          onChangeText={setName}
          maxLength={NAME_MAX}
          editable={!full}
        />
        <TextField
          label="Target"
          hint="A whole number from 1 to 100000."
          placeholder="e.g. 8"
          value={target}
          onChangeText={setTarget}
          keyboardType="number-pad"
          maxLength={6}
          editable={!full}
        />
      </ScrollView>
      <ErrorText message={full ? "You have reached the limit. Delete a counter to add another." : error} />
      <ActionButton label={full ? "Limit reached" : "Add counter"} icon={Plus} onPress={add} disabled={full} />
    </View>
  );
}

function CountdownForm({ store }: { store: CounterStore }) {
  const colors = useThemeColors();
  const [name, setName] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [error, setError] = useState<string | null>(null);
  const full = store.countdowns.length >= MAX_ITEMS;

  function add() {
    const durationSec = durationFromParts(hours, minutes, seconds);
    if (name.trim() === "") return setError("Give the countdown a name.");
    if (durationSec === null) return setError("Enter a duration above zero. Minutes and seconds must be 0 to 59.");
    store.addCountdown(name.trim().slice(0, NAME_MAX), durationSec);
    setName("");
    setHours("");
    setMinutes("");
    setSeconds("");
    setError(null);
  }

  return (
    <View style={styles.form}>
      <ScrollView style={styles.fields} contentContainerStyle={styles.fieldsContent} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
        <TextField
          label="Countdown name"
          placeholder="e.g. Read"
          value={name}
          onChangeText={setName}
          maxLength={NAME_MAX}
          editable={!full}
        />
        <View style={styles.partsRow}>
          <View style={styles.part}>
            <TextField label="Hours" placeholder="0" value={hours} onChangeText={setHours} keyboardType="number-pad" maxLength={2} editable={!full} />
          </View>
          <View style={styles.part}>
            <TextField label="Minutes" placeholder="25" value={minutes} onChangeText={setMinutes} keyboardType="number-pad" maxLength={2} editable={!full} />
          </View>
          <View style={styles.part}>
            <TextField label="Seconds" placeholder="0" value={seconds} onChangeText={setSeconds} keyboardType="number-pad" maxLength={2} editable={!full} />
          </View>
        </View>
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          Up to 99 hours. You get an alert when time is up, if notifications are allowed.
        </Text>
      </ScrollView>
      <ErrorText message={full ? "You have reached the limit. Delete a countdown to add another." : error} />
      <ActionButton label={full ? "Limit reached" : "Add countdown"} icon={Timer} onPress={add} disabled={full} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  fields: {
    maxHeight: FIELDS_MAX_HEIGHT,
  },
  fieldsContent: {
    gap: spacing.md,
  },
  partsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  part: {
    flex: 1,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
});
