import { useEffect, useState } from "react";
import { View } from "react-native";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { spacing } from "@/theme";
import {
  EditFormButton,
  ResourceSuggestorFooter,
  ResourceSuggestorForm,
  ResourceSuggestorResults,
} from "@/features/resource-suggestor/components/ResourceSuggestorTab";
import { useResourceSuggestor } from "@/features/resource-suggestor/hooks/useResourceSuggestor";

export default function ResourceSuggestorRoute() {
  const suggestor = useResourceSuggestor();
  const { result, toggleKept } = suggestor;
  const [editing, setEditing] = useState(false);
  const showResults = !!result && !editing;

  useEffect(() => {
    setEditing(false);
  }, [result]);

  return (
    <ToolScreen
      title="Resource Suggestor"
      headerRight={
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
          {showResults ? <EditFormButton onPress={() => setEditing(true)} /> : null}
          <ResetButton onPress={suggestor.reset} accessibilityLabel="Reset form and results" />
        </View>
      }
      footer={<ResourceSuggestorFooter suggestor={suggestor} onBack={result && editing ? () => setEditing(false) : undefined} />}
      footerSide={false}
    >
      {showResults ? (
        <ResourceSuggestorResults suggestor={suggestor} onToggleKept={toggleKept} />
      ) : (
        <ResourceSuggestorForm suggestor={suggestor} />
      )}
    </ToolScreen>
  );
}
