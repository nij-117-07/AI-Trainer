// src/app/tools/counter-countdown/index.tsx
import { useState } from "react";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { CounterAndCountdownFooter } from "@/features/counters/components/CounterAndCountdownFooter";
import { CounterAndCountdownTool } from "@/features/counters/components/CounterAndCountdownTool";
import { useCounterStore } from "@/features/counters/hooks/useCounterStore";
import type { CounterTab } from "@/features/counters/types";

export default function CounterCountdownRoute() {
  const store = useCounterStore();
  const [tab, setTab] = useState<CounterTab>("counter");

  return (
    <ToolScreen
      title="Counter & Countdown"
      usesAi={false}
      footer={store.loaded ? <CounterAndCountdownFooter store={store} tab={tab} /> : null}
    >
      <CounterAndCountdownTool store={store} tab={tab} onTabChange={setTab} />
    </ToolScreen>
  );
}
