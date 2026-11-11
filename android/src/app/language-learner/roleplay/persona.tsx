// src/app/language-learner/roleplay/persona.tsx
import { useRouter } from "expo-router";
import { Save } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { ActiveLanguageNotice } from "@/features/language-profiles/components/ActiveLanguageNotice";
import { RoleplayPersonaFields } from "@/features/roleplay/components/RoleplayPersonaForm";
import { usePersona } from "@/features/roleplay/hooks/usePersona";

export default function RoleplayPersonaRoute() {
  const router = useRouter();
  const persona = usePersona();

  return (
    <ToolScreen
      title="Persona"
      headerRight={<ResetButton accessibilityLabel="Reset persona" onPress={persona.reset} />}
      footer={<ActionButton label="Save persona" icon={Save} onPress={() => router.back()} />}
      footerSide={false}
    >
      <ActiveLanguageNotice />
      <RoleplayPersonaFields persona={persona} />
    </ToolScreen>
  );
}
