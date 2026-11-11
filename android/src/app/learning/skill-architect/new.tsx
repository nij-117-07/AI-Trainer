// src/app/learning/skill-architect/new.tsx
import { Layers } from "lucide-react-native";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { SkillTreeCreateFooter } from "@/features/skill-architect/components/SkillTreeCreate";
import { useSkillTreeCreate } from "@/features/skill-architect/hooks/useSkillTreeCreate";

export default function SkillArchitectNewRoute() {
  const state = useSkillTreeCreate();

  return (
    <ToolScreen
      title="Create a new skill tree"
      headerRight={<ResetButton onPress={state.reset} />}
      footer={<SkillTreeCreateFooter state={state} />}
    >
      <EmptyHint
        icon={Layers}
        title="Describe what you want to master"
        hint="Fill in the form and tap Generate skill tree. Your tree opens when it is ready."
      />
    </ToolScreen>
  );
}
