// src/app/learning/guides/daily-plan.tsx
import { DailyPlanTab } from "@/features/guides/components/DailyPlanTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function DailyPlanRoute() {
  return (
    <ToolScreen title="Daily Study Plan">
      <DailyPlanTab />
    </ToolScreen>
  );
}
