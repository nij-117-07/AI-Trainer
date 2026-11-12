// src/app/learning/pareto-topics/[id].tsx
import { Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ListChecks, Trash2 } from "lucide-react-native";
import { typeScale, useThemeColors } from "@/theme";
import { ErrorText } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { HeaderAction } from "@/features/roadmap/components/HeaderAction";
import { ParetoResults, ParetoResultsFooter } from "@/features/pareto-topics/components/ParetoResults";
import { useParetoList } from "@/features/pareto-topics/hooks/useParetoList";
import { formSummary } from "@/features/pareto-topics/options";

export default function ParetoTopicsListRoute() {
  const router = useRouter();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const state = useParetoList(String(id ?? ""));
  const { list, loaded, loadError } = state;

  return (
    <ToolScreen
      title={list?.form.field ?? "80/20 Topics"}
      subtitle={list ? formSummary(list.form) : undefined}
      headerRight={
        list ? (
          <HeaderAction
            icon={Trash2}
            label={`Delete ${list.form.field}`}
            destructive
            onPress={() => state.remove(() => router.replace("/learning/pareto-topics" as never))}
          />
        ) : undefined
      }
      footer={list ? <ParetoResultsFooter state={state} /> : undefined}
    >
      {list ? (
        <ParetoResults result={list.result} coverage={state.coverage} onToggleKept={state.toggleKept} />
      ) : (
        <>
          <ErrorText message={loadError} />
          {!loaded ? <Text style={[typeScale.body, { color: colors.mutedForeground }]}>Loading this list…</Text> : null}
          {loaded && !loadError ? (
            <EmptyHint icon={ListChecks} title="List not found" hint="It may have been deleted." />
          ) : null}
        </>
      )}
    </ToolScreen>
  );
}
