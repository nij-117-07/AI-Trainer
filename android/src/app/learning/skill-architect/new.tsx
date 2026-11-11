// src/app/learning/skill-architect/new.tsx
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { SkillTreeCreateFooter, SkillTreeCreateForm } from "@/features/skill-architect/components/SkillTreeCreate";
import { useSkillTreeCreate } from "@/features/skill-architect/hooks/useSkillTreeCreate";

export default function SkillArchitectNewRoute() {
  const state = useSkillTreeCreate();

  return (
    <ToolScreen
      title="New skill tree"
      headerRight={<ResetButton onPress={state.reset} accessibilityLabel="Reset form" />}
      footer={<SkillTreeCreateFooter state={state} />}
      footerSide={false}
    >
      <SkillTreeCreateForm state={state} />
    </ToolScreen>
  );
}
