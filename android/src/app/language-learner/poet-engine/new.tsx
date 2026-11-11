// src/app/language-learner/poet-engine/new.tsx
import { useRouter } from "expo-router";
import { Feather } from "lucide-react-native";
import { useLayout } from "@/theme";
import { ActiveLanguageNotice } from "@/features/language-profiles/components/ActiveLanguageNotice";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ErrorText } from "@/components/tool/FormControls";
import { ResetButton } from "@/components/tool/ResetButton";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import {
  PoetEngineFormFields,
  PoetEngineFormFooter,
  PoetEngineFormSidePanel,
  usePoetEngineForm,
} from "@/features/poet-engine/components/PoetEngineForm";
import { PoetEngineResultView } from "@/features/poet-engine/components/PoetEngineResultView";
import { usePersistedResult } from "@/features/poet-engine/hooks/usePersistedDraft";
import { SAVE_FAILED_MESSAGE } from "@/features/poet-engine/lib/persistence";

export default function PoetEngineNewRoute() {
  const router = useRouter();
  const { size } = useLayout();
  const poet = usePoetEngineForm(() => router.back());
  const { result: current, saveFailed } = usePersistedResult();
  const sidePanel = size !== "phone";

  return (
    <ToolScreen
      title="New explanation"
      wide={sidePanel}
      headerRight={<ResetButton onPress={poet.reset} accessibilityLabel="Reset form" />}
      footer={sidePanel ? <PoetEngineFormSidePanel poet={poet} /> : <PoetEngineFormFooter poet={poet} />}
    >
      <ActiveLanguageNotice />
      {sidePanel ? (
        <Section>
          <ErrorText message={saveFailed ? SAVE_FAILED_MESSAGE : null} />
          {current ? (
            <PoetEngineResultView result={current} />
          ) : (
            <EmptyHint icon={Feather} title="No explanation yet" hint="Your explanation will appear here." />
          )}
        </Section>
      ) : (
        <PoetEngineFormFields poet={poet} />
      )}
    </ToolScreen>
  );
}
