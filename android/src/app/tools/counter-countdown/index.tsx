// src/app/tools/counter-countdown/index.tsx
import { CounterAndCountdownTool } from "@/features/counters/components/CounterAndCountdownTool";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function CounterCountdownRoute() {
  return (
    <ToolScreen title="Counter & Countdown">
      <CounterAndCountdownTool />
    </ToolScreen>
  );
}
