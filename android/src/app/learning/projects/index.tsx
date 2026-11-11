import { useEffect, useState } from "react";
import { View } from "react-native";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { spacing } from "@/theme";
import {
  EditFormButton,
  ProjectFormBody,
  ProjectFormFooter,
  ProjectResults,
  ProjectResultsFooter,
} from "@/features/projects/components/ProjectRecommenderTab";
import { useProjectRecommender } from "@/features/projects/hooks/useProjectRecommender";

export default function ProjectsRoute() {
  const recommender = useProjectRecommender();
  const { result, form, toggleKept } = recommender;
  const [editing, setEditing] = useState(false);
  const shown = result && !editing ? result : null;

  useEffect(() => {
    setEditing(false);
  }, [result]);

  return (
    <ToolScreen
      title="Project Recommender"
      headerRight={
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
          {shown ? <EditFormButton onPress={() => setEditing(true)} /> : null}
          <ResetButton onPress={recommender.reset} accessibilityLabel="Reset form and results" />
        </View>
      }
      footer={
        shown ? (
          <ProjectResultsFooter recommender={recommender} />
        ) : (
          <ProjectFormFooter recommender={recommender} onBack={result ? () => setEditing(false) : undefined} />
        )
      }
    >
      {shown ? (
        <ProjectResults result={shown} difficulty={form.difficultyLevel} onToggleKept={toggleKept} />
      ) : (
        <ProjectFormBody recommender={recommender} />
      )}
    </ToolScreen>
  );
}
