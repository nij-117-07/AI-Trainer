// src/app/learning/explainer/atoz.tsx
import { ToolScreen } from "@/components/tool/ToolScreen";
import {
  TutorialFooter,
  TutorialForm,
  TutorialHeaderActions,
  TutorialResults,
  useTutorial,
} from "@/features/explainer/components/AtozTab";

export default function AtozRoute() {
  const state = useTutorial();

  return (
    <ToolScreen
      title="A-to-Z Tutorial"
      headerRight={<TutorialHeaderActions state={state} />}
      footer={<TutorialFooter state={state} />}
    >
      {state.editing ? <TutorialForm state={state} /> : <TutorialResults state={state} />}
    </ToolScreen>
  );
}
