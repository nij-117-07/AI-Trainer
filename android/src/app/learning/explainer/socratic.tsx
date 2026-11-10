// src/app/learning/explainer/socratic.tsx
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { SocraticFooter, SocraticResults, useSocratic } from "@/features/explainer/components/SocraticTab";

export default function SocraticRoute() {
  const state = useSocratic();

  return (
    <ToolScreen
      title="Socratic Mentor"
      headerRight={<ResetButton onPress={state.reset} />}
      footer={<SocraticFooter state={state} />}
    >
      <SocraticResults state={state} />
    </ToolScreen>
  );
}
