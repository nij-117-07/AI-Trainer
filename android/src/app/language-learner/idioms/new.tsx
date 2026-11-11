// src/app/language-learner/idioms/new.tsx
import { useRouter } from "expo-router";
import { ActiveLanguageNotice } from "@/features/language-profiles/components/ActiveLanguageNotice";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { IdiomsFormFields, IdiomsFormFooter, useIdiomForm } from "@/features/idioms/components/IdiomsForm";

export default function IdiomsNewRoute() {
  const router = useRouter();
  const idioms = useIdiomForm(() => router.back());

  return (
    <ToolScreen
      title="New idiom"
      headerRight={<ResetButton onPress={idioms.reset} />}
      footerSide={false}
      footer={<IdiomsFormFooter idioms={idioms} />}
    >
      <ActiveLanguageNotice />
      <IdiomsFormFields idioms={idioms} />
    </ToolScreen>
  );
}
