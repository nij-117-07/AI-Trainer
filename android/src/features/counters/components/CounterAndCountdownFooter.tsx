// src/features/counters/components/CounterAndCountdownFooter.tsx
/** Footer form for Counter & Countdown: the fields for the open tab, the error, and one primary add button. */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
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

function SuccessText({ message }: { message: string | null }) {
  const colors = useThemeColors();
  if (!message) return null;
  return (
    <Text accessibilityLiveRegion="polite" style={[styles.success, { color: colors.primary }]}>
      {message}
    </Text>
  );
}

function CounterForm({ store }: { store: CounterStore }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);
  const full = store.counters.length >= MAX_ITEMS;

  function add() {
    const parsed = parseTarget(target);
    if (name.trim() === "") return setError("Give the counter a name.");
    if (parsed === null) return setError("Target must be a whole number from 1 to 100000.");
    const counterName = name.trim().slice(0, NAME_MAX);
    store.addCounter(counterName, parsed);
    setName("");
    setTarget("");
    setError(null);
    setAdded(`Added ${counterName}.`);
  }

  return (
    <View style={styles.form}>
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
      <SuccessText message={error ? null : added} />
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
  const [added, setAdded] = useState<string | null>(null);
  const full = store.countdowns.length >= MAX_ITEMS;

  function add() {
    const durationSec = durationFromParts(hours, minutes, seconds);
    if (name.trim() === "") return setError("Give the countdown a name.");
    if (durationSec === null) return setError("Enter a duration above zero. Minutes and seconds must be 0 to 59.");
    const countdownName = name.trim().slice(0, NAME_MAX);
    store.addCountdown(countdownName, durationSec);
    setName("");
    setHours("");
    setMinutes("");
    setSeconds("");
    setError(null);
    setAdded(`Added ${countdownName}.`);
  }

  return (
    <View style={styles.form}>
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
      <SuccessText message={error ? null : added} />
      <ErrorText message={full ? "You have reached the limit. Delete a countdown to add another." : error} />
      <ActionButton label={full ? "Limit reached" : "Add countdown"} icon={Timer} onPress={add} disabled={full} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
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
  success: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
});
