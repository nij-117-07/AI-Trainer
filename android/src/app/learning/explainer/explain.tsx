// src/app/learning/explainer/explain.tsx
import { useEffect, useState } from "react";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import {
  ExplainFooter,
  ExplainForm,
  ExplainResultFooter,
  ExplainResults,
  useQuickExplain,
} from "@/features/explainer/components/ExplainTab";

export default function ExplainRoute() {
  const state = useQuickExplain();
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (state.result) setEditing(false);
  }, [state.result]);

  return (
    <ToolScreen
      title="Quick explain"
      headerRight={<ResetButton onPress={state.reset} accessibilityLabel="Reset explanation" />}
      footer={editing ? <ExplainFooter state={state} /> : <ExplainResultFooter onNew={() => setEditing(true)} />}
    >
      {editing ? <ExplainForm state={state} /> : <ExplainResults state={state} />}
    </ToolScreen>
  );
}
