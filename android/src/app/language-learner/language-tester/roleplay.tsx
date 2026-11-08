// src/app/language-learner/language-tester/roleplay.tsx
import { ToolScreen } from "@/components/tool/ToolScreen";
import { RoleplayTab } from "@/features/language-tester/components/RoleplayTab";

export default function LanguageTesterRoleplayRoute() {
  return (
    <ToolScreen title="Roleplay Coach">
      <RoleplayTab />
    </ToolScreen>
  );
}
