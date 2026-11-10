// src/app/learning/explainer/atoz.tsx
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { TutorialFooter, TutorialResults, useTutorial } from "@/features/explainer/components/AtozTab";

export default function AtozRoute() {
  const state = useTutorial();

  return (
    <ToolScreen
      title="A-to-Z Tutorial"
      headerRight={<ResetButton onPress={state.reset} />}
      footer={<TutorialFooter state={state} />}
    >
      <TutorialResults state={state} />
    </ToolScreen>
  );
}
