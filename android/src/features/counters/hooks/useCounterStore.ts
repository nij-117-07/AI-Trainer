/** Counters, countdown presets, and running timer states kept on the device. Every change is saved as soon as it happens. */
import { useCallback, useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { newId } from "@/features/tasks/lib/ids";
import type { Countdown, Counter, TimerState } from "../types";
import { adjustCount, MAX_ITEMS, normalizeCounterData, type CounterData } from "../lib/counters";

const STORAGE_KEY = "tools.counters.v1";

export function useCounterStore() {
  const [data, setData] = useState<CounterData>({ counters: [], countdowns: [], timers: {} });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(STORAGE_KEY, null).then((stored) => {
      if (!active) return;
      setData(normalizeCounterData(stored));
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (loaded) void saveDocument(STORAGE_KEY, data);
  }, [loaded, data]);

  const addCounter = useCallback((name: string, target: number) => {
    setData((prev) => {
      if (prev.counters.length >= MAX_ITEMS) return prev;
      const counter: Counter = { id: newId(), name, target, count: 0, createdAt: new Date().toISOString() };
      return { ...prev, counters: [...prev.counters, counter] };
    });
  }, []);

  const changeCount = useCallback((id: string, delta: number) => {
    setData((prev) => ({
      ...prev,
      counters: prev.counters.map((counter) =>
        counter.id === id ? { ...counter, count: adjustCount(counter.count, delta) } : counter,
      ),
    }));
  }, []);

  const resetCount = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      counters: prev.counters.map((counter) => (counter.id === id ? { ...counter, count: 0 } : counter)),
    }));
  }, []);

  const removeCounter = useCallback((id: string) => {
    setData((prev) => ({ ...prev, counters: prev.counters.filter((counter) => counter.id !== id) }));
  }, []);

  const addCountdown = useCallback((name: string, durationSec: number) => {
    setData((prev) => {
      if (prev.countdowns.length >= MAX_ITEMS) return prev;
      const countdown: Countdown = { id: newId(), name, durationSec, createdAt: new Date().toISOString() };
      return { ...prev, countdowns: [...prev.countdowns, countdown] };
    });
  }, []);

  const removeCountdown = useCallback((id: string) => {
    setData((prev) => {
      const { [id]: _removed, ...timers } = prev.timers;
      return { ...prev, countdowns: prev.countdowns.filter((countdown) => countdown.id !== id), timers };
    });
  }, []);

  const setTimer = useCallback((id: string, timer: TimerState) => {
    setData((prev) => ({ ...prev, timers: { ...prev.timers, [id]: timer } }));
  }, []);

  return {
    counters: data.counters,
    countdowns: data.countdowns,
    timers: data.timers,
    loaded,
    addCounter,
    changeCount,
    resetCount,
    removeCounter,
    addCountdown,
    removeCountdown,
    setTimer,
  };
}
