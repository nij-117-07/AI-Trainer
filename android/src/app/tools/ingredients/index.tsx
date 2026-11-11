// src/app/tools/ingredients/index.tsx
import { useRouter } from "expo-router";
import { Camera, ShieldCheck } from "lucide-react-native";
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
          label="Check ingredients"
          icon={Camera}
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
            hint="Choose a photo of an ingredients list to start."
          />
        )}
      </Section>
    </ToolScreen>
  );
}
