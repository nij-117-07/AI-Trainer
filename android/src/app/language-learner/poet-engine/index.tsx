// src/app/language-learner/poet-engine/index.tsx
import { useRouter } from "expo-router";
import { Feather, Plus } from "lucide-react-native";
import { ActionButton, ErrorText } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { PoetEngineResultView } from "@/features/poet-engine/components/PoetEngineResultView";
import { usePersistedResult } from "@/features/poet-engine/hooks/usePersistedDraft";
import { SAVE_FAILED_MESSAGE } from "@/features/poet-engine/lib/persistence";

export default function PoetEngineRoute() {
  const router = useRouter();
  const { result, saveFailed } = usePersistedResult();

  return (
    <ToolScreen
      title="Poet Engine"
      wide
      footerSide={false}
      footer={
        <ActionButton
          label="New explanation"
          icon={Plus}
          onPress={() => router.push("/language-learner/poet-engine/new")}
        />
      }
    >
      <Section>
        <ErrorText message={saveFailed ? SAVE_FAILED_MESSAGE : null} />
        {result ? (
          <PoetEngineResultView result={result} />
        ) : (
          <EmptyHint icon={Feather} title="No explanation yet" hint="Your explanation will appear here." />
        )}
      </Section>
    </ToolScreen>
  );
}
