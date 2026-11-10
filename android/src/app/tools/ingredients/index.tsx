// src/app/tools/ingredients/index.tsx
import { useRouter } from "expo-router";
import { ShieldCheck, Sparkles } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { IngredientsResult } from "@/features/ingredients/components/IngredientsResult";
import { usePersistedResult } from "@/features/ingredients/hooks/usePersistedDraft";

export default function IngredientsRoute() {
  const router = useRouter();
  const result = usePersistedResult();

  return (
    <ToolScreen
      title="Ingredients Checker"
      footer={
        <ActionButton
          label="New check"
          icon={Sparkles}
          onPress={() => router.push("/tools/ingredients/new")}
        />
      }
    >
      <Section>
        {result ? (
          <IngredientsResult result={result} />
        ) : (
          <EmptyHint
            icon={ShieldCheck}
            title="No check yet"
            hint="Tap New check below, add a photo of the ingredients list, then analyze it."
          />
        )}
      </Section>
    </ToolScreen>
  );
}
