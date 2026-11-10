// src/app/learning/explainer/explain.tsx
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { ExplainFooter, ExplainResults, useQuickExplain } from "@/features/explainer/components/ExplainTab";

export default function ExplainRoute() {
  const state = useQuickExplain();

  return (
    <ToolScreen
      title="Quick Explain"
      headerRight={<ResetButton onPress={state.reset} />}
      footer={<ExplainFooter state={state} />}
    >
      <ExplainResults state={state} />
    </ToolScreen>
  );
}
