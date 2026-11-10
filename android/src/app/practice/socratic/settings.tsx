// src/app/practice/socratic/settings.tsx
import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { SocraticSettingsFields } from "@/features/socratic/components/SocraticSettingsForm";
import { useSocraticSettings } from "@/features/socratic/hooks/useSocraticSettings";

export default function SocraticSettingsRoute() {
  const router = useRouter();
  const settings = useSocraticSettings();

  return (
    <ToolScreen
      title="Discussion settings"
      headerRight={<ResetButton label="Reset settings" onPress={settings.reset} />}
      footer={<ActionButton label="Use these settings" icon={Check} onPress={() => router.back()} />}
    >
      <SocraticSettingsFields settings={settings} />
    </ToolScreen>
  );
}
