// src/app/practice/battleground/new.tsx
import { useRouter } from "expo-router";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { BattleFormFields, BattleFormFooter } from "@/features/battleground/components/BattleForm";
import { useBattleSetup } from "@/features/battleground/hooks/useBattleSetup";

export default function BattlegroundNewRoute() {
  const router = useRouter();
  const setup = useBattleSetup(() => router.back());

  return (
    <ToolScreen
      title="New battle"
      headerRight={<ResetButton accessibilityLabel="Reset form" onPress={setup.reset} />}
      footer={<BattleFormFooter setup={setup} />}
    >
      <BattleFormFields setup={setup} />
    </ToolScreen>
  );
}
