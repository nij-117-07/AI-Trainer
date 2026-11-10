// src/app/learning/explainer/feynman.tsx
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { FeynmanFooter, FeynmanResults, useFeynman } from "@/features/explainer/components/FeynmanTab";

export default function FeynmanRoute() {
  const state = useFeynman();

  return (
    <ToolScreen
      title="Feynman Explainer"
      headerRight={<ResetButton onPress={state.reset} />}
      footer={<FeynmanFooter state={state} />}
    >
      <FeynmanResults state={state} />
    </ToolScreen>
  );
}
