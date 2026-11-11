// src/app/language-learner/roleplay/roles.tsx
import { RoleplayRolesView } from "@/features/roleplay/components/RoleplayRolesView";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function RoleplayRolesRoute() {
  return (
    <ToolScreen title="Saved Personas">
      <RoleplayRolesView />
    </ToolScreen>
  );
}
