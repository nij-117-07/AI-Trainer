// src/app/practice/observation-trainer/index.tsx
import { useRouter } from "expo-router";
import { Eye } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { ObservationResult } from "@/features/observation-trainer/components/ObservationResult";
import { usePersistedTraining } from "@/features/observation-trainer/hooks/usePersistedTraining";

export default function ObservationTrainerRoute() {
  const router = useRouter();
  const result = usePersistedTraining();

  return (
    <ToolScreen
      title="Observation Trainer"
      footer={
        <ActionButton
          label="New training"
          icon={Eye}
          onPress={() => router.push("/practice/observation-trainer/new")}
        />
      }
    >
      <Section>
        {result ? (
          <ObservationResult result={result} />
        ) : (
          <EmptyHint
            icon={Eye}
            title="No report yet"
            hint="Tap New training below, find or upload an image, describe what you saw, then train."
          />
        )}
      </Section>
    </ToolScreen>
  );
}
