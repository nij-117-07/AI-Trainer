/** Counter & Countdown body: the tab switch and the list of counters or countdowns. The add form lives in the footer. */
import { useEffect } from "react";
import { Plus, Timer } from "lucide-react-native";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ChoiceChips } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import type { CounterStore } from "../hooks/useCounterStore";
import { cancelCountdownEnd, setupCountdownNotifications } from "../lib/countdown-notifications";
import { idleTimer } from "../lib/timer";
import type { CounterTab } from "../types";
import { CounterCard } from "./CounterCard";
import { CountdownCard } from "./CountdownCard";

const TAB_OPTIONS: { value: CounterTab; label: string }[] = [
  { value: "counter", label: "Counter" },
  { value: "countdown", label: "Countdown" },
];

interface CounterAndCountdownToolProps {
  store: CounterStore;
  tab: CounterTab;
  onTabChange: (tab: CounterTab) => void;
}

export function CounterAndCountdownTool({ store, tab, onTabChange }: CounterAndCountdownToolProps) {
  useEffect(() => {
    setupCountdownNotifications();
  }, []);

  if (!store.loaded) return null;

  return (
    <Section>
      <ChoiceChips options={TAB_OPTIONS} value={tab} onChange={onTabChange} wrap={false} />
      {tab === "counter" ? <CounterList store={store} /> : <CountdownList store={store} />}
    </Section>
  );
}

function CounterList({ store }: { store: CounterStore }) {
  if (store.counters.length === 0) {
    return <EmptyHint icon={Plus} title="No counters yet" hint={'Use the form below. For example, "Drink water" with a target of 8.'} />;
  }
  return (
    <>
      {store.counters.map((counter) => (
        <CounterCard
          key={counter.id}
          counter={counter}
          onChange={(delta) => store.changeCount(counter.id, delta)}
          onReset={() => store.resetCount(counter.id)}
          onDelete={() => store.removeCounter(counter.id)}
        />
      ))}
    </>
  );
}

function CountdownList({ store }: { store: CounterStore }) {
  if (store.countdowns.length === 0) {
    return <EmptyHint icon={Timer} title="No countdowns yet" hint={'Use the form below. For example, "Read" for 25 minutes.'} />;
  }
  return (
    <>
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
    </>
  );
}
