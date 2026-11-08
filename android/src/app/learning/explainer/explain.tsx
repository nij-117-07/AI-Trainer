// src/app/learning/explainer/explain.tsx
import { ExplainTab } from "@/features/explainer/components/ExplainTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function ExplainRoute() {
  return (
    <ToolScreen title="Quick Explain">
      <ExplainTab />
    </ToolScreen>
  );
}
