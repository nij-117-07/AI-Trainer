// src/features/counters/components/CountdownCard.tsx
/** One countdown: the time left, its progress, and icon buttons for start, pause, and reset. Delete asks first. */
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Pause, Play, RotateCcw, Trash2 } from "lucide-react-native";
import { cardPadding, shape, spacing, touchTarget, typeScale, useLayout, useThemeColors } from "@/theme";
import { pointerCursor } from "@/components/tool/FormControls";
import { ensureCountdownPermission, cancelCountdownEnd, scheduleCountdownEnd } from "../lib/countdown-notifications";
import { formatClock, idleTimer, pauseTimer, remainingMs, startTimer, syncTimer } from "../lib/timer";
import type { Countdown, TimerState, TimerStatus } from "../types";
import { IconButton } from "./IconButton";

const STATUS_TEXT: Record<TimerStatus, string> = {
  idle: "Ready",
  running: "Running",
  paused: "Paused",
  done: "Time is up",
};

interface CountdownCardProps {
  countdown: Countdown;
  timer: TimerState;
  onChange: (timer: TimerState) => void;
  onDelete: () => void;
}

export function CountdownCard({ countdown, timer, onChange, onDelete }: CountdownCardProps) {
  const colors = useThemeColors();
  const { size } = useLayout();
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
  const toggleLabel = running ? "Pause" : timer.status === "paused" ? "Resume" : "Start";
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

  function confirmDelete() {
    Alert.alert(`Delete ${countdown.name}?`, "Its timer will be removed and you will not get an alert.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onDelete },
    ]);
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
          {countdown.name}
        </Text>
        <Pressable
          onPress={confirmDelete}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${countdown.name}`}
          style={({ pressed }) => [styles.deleteButton, pointerCursor, pressed && styles.pressed]}
        >
          <Trash2 size={20} color={colors.destructive} />
        </Pressable>
      </View>

      <Text
        accessibilityRole="timer"
        accessibilityLabel={`${countdown.name} time left ${formatClock(left)}`}
        style={[styles.clock, { color: done ? colors.primary : colors.foreground, fontSize: size === "phone" ? 48 : 72 }]}
      >
        {formatClock(left)}
      </Text>

      <View
        style={[styles.track, { backgroundColor: colors.muted }]}
        accessibilityRole="progressbar"
        accessibilityLabel={`${countdown.name} progress`}
        accessibilityValue={{ min: 0, max: 100, now: Math.round((1 - fraction) * 100) }}
      >
        <View style={[styles.fill, { backgroundColor: colors.primary, width: `${fraction * 100}%` }]} />
      </View>
      <Text
        accessibilityLiveRegion="polite"
        style={[typeScale.label, { color: done ? colors.primary : colors.mutedForeground }]}
      >
        {STATUS_TEXT[timer.status]}
      </Text>

      <View style={styles.buttons}>
        {done ? (
          <View />
        ) : (
          <IconButton
            accessibilityLabel={`Reset ${countdown.name}`}
            icon={RotateCcw}
            disabled={timer.status === "idle"}
            onPress={reset}
          />
        )}
        {done ? (
          <IconButton accessibilityLabel={`Restart ${countdown.name}`} icon={RotateCcw} primary onPress={reset} />
        ) : (
          <IconButton
            accessibilityLabel={`${toggleLabel} ${countdown.name}`}
            icon={running ? Pause : Play}
            primary
            onPress={togglePlay}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: cardPadding.compact,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    ...typeScale.title,
  },
  deleteButton: {
    width: touchTarget,
    height: touchTarget,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: shape.full,
  },
  clock: {
    fontWeight: "700",
    letterSpacing: -1,
    fontVariant: ["tabular-nums"],
  },
  track: {
    height: 8,
    borderRadius: shape.full,
    overflow: "hidden",
  },
  fill: {
    height: 8,
    borderRadius: shape.full,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pressed: {
    opacity: 0.85,
  },
});
