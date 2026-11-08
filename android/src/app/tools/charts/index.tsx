// src/app/tools/charts/index.tsx
import { ChartsTool } from "@/features/charts/components/ChartsTool";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function ChartsRoute() {
  return (
    <ToolScreen title="Chart.js Generator">
      <ChartsTool />
    </ToolScreen>
  );
}
