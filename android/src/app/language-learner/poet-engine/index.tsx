// src/app/language-learner/poet-engine/index.tsx
import { useRouter } from "expo-router";
import { Feather } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { PoetEngineResultView } from "@/features/poet-engine/components/PoetEngineResultView";
import { usePersistedResult } from "@/features/poet-engine/hooks/usePersistedDraft";

export default function PoetEngineRoute() {
  const router = useRouter();
  const result = usePersistedResult();

  return (
    <ToolScreen
      title="Poet Engine"
      footer={
        <ActionButton
          label="New explanation"
          icon={Feather}
          onPress={() => router.push("/language-learner/poet-engine/new")}
        />
      }
    >
      <Section>
        {result ? (
          <PoetEngineResultView result={result} />
        ) : (
          <EmptyHint
            icon={Feather}
            title="No explanation yet"
            hint="Tap New explanation below, choose a concept and poetic style, then generate."
          />
        )}
      </Section>
    </ToolScreen>
  );
}
