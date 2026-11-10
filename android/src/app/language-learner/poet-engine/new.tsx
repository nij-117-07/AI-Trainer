// src/app/language-learner/poet-engine/new.tsx
import { useRouter } from "expo-router";
import { ActiveLanguageNotice } from "@/features/language-profiles/components/ActiveLanguageNotice";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { PoetEngineFormFields, PoetEngineFormFooter, usePoetEngineForm } from "@/features/poet-engine/components/PoetEngineForm";

export default function PoetEngineNewRoute() {
  const router = useRouter();
  const poet = usePoetEngineForm(() => router.back());

  return (
    <ToolScreen
      title="New explanation"
      headerRight={<ResetButton onPress={poet.reset} />}
      footer={<PoetEngineFormFooter poet={poet} />}
    >
      <ActiveLanguageNotice />
      <PoetEngineFormFields poet={poet} />
    </ToolScreen>
  );
}
