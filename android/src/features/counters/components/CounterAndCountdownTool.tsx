/** Counter & Countdown: count progress toward a target, or run a timed countdown with pause, play, and reset. */
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Minus, Pause, Play, Plus, RotateCcw, Timer, Trash2, type LucideIcon } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ChoiceChips, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { useCounterStore } from "../hooks/useCounterStore";
import { cancelCountdownEnd, ensureCountdownPermission, scheduleCountdownEnd, setupCountdownNotifications } from "../lib/countdown-notifications";
import { MAX_ITEMS, NAME_MAX, parseTarget, progressOf } from "../lib/counters";
import { durationFromParts, formatClock, idleTimer, pauseTimer, remainingMs, startTimer, syncTimer } from "../lib/timer";
import type { Countdown, Counter, CounterTab, TimerState } from "../types";

const TAB_OPTIONS: { value: CounterTab; label: string }[] = [
  { value: "counter", label: "Counter" },
  { value: "countdown", label: "Countdown" },
];

export function CounterAndCountdownTool() {
  const store = useCounterStore();
  const [tab, setTab] = useState<CounterTab>("counter");

  useEffect(() => {
    setupCountdownNotifications();
  }, []);

  return (
    <Section>
      <ChoiceChips options={TAB_OPTIONS} value={tab} onChange={setTab} wrap={false} />
      {tab === "counter" ? <CounterPanel store={store} /> : <CountdownPanel store={store} />}
    </Section>
  );
}

type CounterStore = ReturnType<typeof useCounterStore>;

function CounterPanel({ store }: { store: CounterStore }) {
  const colors = useThemeColors();
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
    <>
      {store.counters.length === 0 && (
        <Text style={[styles.empty, { color: colors.mutedForeground }]}>
          Create a counter, for example "Drink water" with a target of 8.
        </Text>
      )}
      {store.counters.map((counter) => (
        <CounterCard key={counter.id} counter={counter} store={store} />
      ))}

      <Panel>
        <TextField label="Counter name" placeholder="e.g. Drink water" value={name} onChangeText={setName} maxLength={NAME_MAX} editable={!full} />
        <TextField label="Target" placeholder="8" value={target} onChangeText={setTarget} keyboardType="number-pad" editable={!full} />
        {error && <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>}
        <ActionButton label={full ? "Limit reached" : "Add counter"} icon={Plus} onPress={add} disabled={full} />
      </Panel>
    </>
  );
}

function CounterCard({ counter, store }: { counter: Counter; store: CounterStore }) {
  const colors = useThemeColors();
  const progress = progressOf(counter.count, counter.target);
  const reached = counter.count >= counter.target;

  return (
    <Panel>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={1}>
          {counter.name}
        </Text>
        <Pressable onPress={() => store.removeCounter(counter.id)} accessibilityRole="button" accessibilityLabel={`Delete ${counter.name}`} hitSlop={8}>
          <Trash2 size={18} color={colors.destructive} />
        </Pressable>
      </View>
      <Text style={[styles.bigNumber, { color: colors.foreground }]}>
        {counter.count} / {counter.target}
      </Text>
      <View style={[styles.track, { backgroundColor: colors.muted }]}>
        <View style={[styles.fill, { backgroundColor: colors.primary, width: `${progress * 100}%` }]} />
      </View>
      {reached && <Text style={[styles.muted, { color: colors.primary }]}>Goal reached</Text>}
      <View style={styles.buttonRow}>
        <CircleButton label="Decrease" icon={Minus} onPress={() => store.changeCount(counter.id, -1)} />
        <CircleButton label="Increase" icon={Plus} primary onPress={() => store.changeCount(counter.id, 1)} />
        <CircleButton label="Reset counter" icon={RotateCcw} onPress={() => store.resetCount(counter.id)} />
      </View>
    </Panel>
  );
}

function CountdownPanel({ store }: { store: CounterStore }) {
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
    <>
      {store.countdowns.length === 0 && (
        <Text style={[styles.empty, { color: colors.mutedForeground }]}>
          Create a countdown, for example "Read" for 2 hours.
        </Text>
      )}
      {store.countdowns.map((countdown) => (
        <CountdownCard
          key={countdown.id}
          countdown={countdown}
          timer={store.timers[countdown.id] ?? idleTimer(countdown.durationSec * 1000)}
          onChange={(timer) => store.setTimer(countdown.id, timer)}
          onDelete={() => {
            void cancelCountdownEnd(countdown.id);
            store.removeCountdown(countdown.id);
          }}
        />
      ))}

      <Panel>
        <TextField label="Countdown name" placeholder="e.g. Read" value={name} onChangeText={setName} maxLength={NAME_MAX} editable={!full} />
        <View style={styles.partsRow}>
          <View style={styles.part}>
            <TextField label="Hours" placeholder="0" value={hours} onChangeText={setHours} keyboardType="number-pad" editable={!full} />
          </View>
          <View style={styles.part}>
            <TextField label="Minutes" placeholder="0" value={minutes} onChangeText={setMinutes} keyboardType="number-pad" editable={!full} />
          </View>
          <View style={styles.part}>
            <TextField label="Seconds" placeholder="0" value={seconds} onChangeText={setSeconds} keyboardType="number-pad" editable={!full} />
          </View>
        </View>
        {error && <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>}
        <ActionButton label={full ? "Limit reached" : "Add countdown"} icon={Timer} onPress={add} disabled={full} />
      </Panel>
    </>
  );
}

interface CountdownCardProps {
  countdown: Countdown;
  timer: TimerState;
  onChange: (timer: TimerState) => void;
  onDelete: () => void;
}

function CountdownCard({ countdown, timer, onChange, onDelete }: CountdownCardProps) {
  const colors = useThemeColors();
  const durationMs = countdown.durationSec * 1000;
  const [now, setNow] = useState(() => Date.now());
  const running = timer.status === "running";

  // The interval reads the latest timer through a ref so it never saves stale state.
  const latest = useRef({ timer, onChange });
  latest.current = { timer, onChange };

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const current = Date.now();
      const { timer: active, onChange: save } = latest.current;
      setNow(current);
      if (active.status === "running" && active.endsAt !== null && current >= active.endsAt) {
        save(syncTimer(active, current));
        void cancelCountdownEnd(countdown.id);
      }
    }, 250);
    return () => clearInterval(id);
  }, [running, countdown.id]);

  const left = remainingMs(timer, now);
  const done = timer.status === "done";
  const fraction = durationMs > 0 ? Math.max(0, Math.min(1, left / durationMs)) : 0;

  async function togglePlay() {
    const current = Date.now();
    setNow(current);
    if (running) {
      onChange(pauseTimer(timer, current));
      await cancelCountdownEnd(countdown.id);
      return;
    }
    const next = startTimer(timer, current);
    onChange(next);
    if (next.status === "running" && next.endsAt !== null && (await ensureCountdownPermission())) {
      await scheduleCountdownEnd(countdown.id, countdown.name, next.endsAt);
    }
  }

  function reset() {
    setNow(Date.now());
    onChange(idleTimer(durationMs));
    void cancelCountdownEnd(countdown.id);
  }

  return (
    <Panel>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={1}>
          {countdown.name}
        </Text>
        <Pressable onPress={onDelete} accessibilityRole="button" accessibilityLabel={`Delete ${countdown.name}`} hitSlop={8}>
          <Trash2 size={18} color={colors.destructive} />
        </Pressable>
      </View>
      <Text style={[styles.clock, { color: done ? colors.primary : colors.foreground }]}>{formatClock(left)}</Text>
      <View style={[styles.track, { backgroundColor: colors.muted }]}>
        <View style={[styles.fill, { backgroundColor: colors.primary, width: `${fraction * 100}%` }]} />
      </View>
      <Text style={[styles.muted, { color: colors.mutedForeground }]}>
        {done ? "Time is up" : running ? "Running" : timer.status === "paused" ? "Paused" : `Goal: ${formatClock(durationMs)}`}
      </Text>
      <View style={styles.buttonRow}>
        <CircleButton label={running ? "Pause" : "Play"} icon={running ? Pause : Play} primary disabled={done} onPress={togglePlay} />
        <CircleButton label="Reset timer" icon={RotateCcw} onPress={reset} />
      </View>
    </Panel>
  );
}

interface CircleButtonProps {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
}

function CircleButton({ label, icon: Icon, onPress, primary = false, disabled = false }: CircleButtonProps) {
  const colors = useThemeColors();
  const foreground = primary ? colors.primaryForeground : colors.foreground;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.circle,
        primary
          ? { backgroundColor: colors.primary }
          : { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
        pressed && { opacity: 0.8 },
        disabled && { opacity: 0.4 },
      ]}
    >
      <Icon size={20} color={foreground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  empty: { fontSize: 14, textAlign: "center", paddingVertical: spacing.md },
  error: { fontSize: 13 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  cardTitle: { flex: 1, fontSize: 17, fontWeight: "600" },
  bigNumber: { fontSize: 30, fontWeight: "700", letterSpacing: -0.5 },
  clock: { fontSize: 40, fontWeight: "700", letterSpacing: -1, fontVariant: ["tabular-nums"] },
  muted: { fontSize: 13, lineHeight: 18 },
  track: { height: 8, borderRadius: radius.full, overflow: "hidden" },
  fill: { height: 8, borderRadius: radius.full },
  buttonRow: { flexDirection: "row", gap: spacing.md, justifyContent: "center" },
  circle: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  partsRow: { flexDirection: "row", gap: spacing.sm },
  part: { flex: 1 },
});
