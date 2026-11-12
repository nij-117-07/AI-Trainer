// src/app/practice/confidence-builder/index.tsx
/** Confidence Builder home: saved task sets and the round in progress on the Tasks tab, and the practice History. */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { HeartHandshake, ListChecks, Plus } from "lucide-react-native";
import { spacing, typeScale, useThemeColors } from "@/theme";
import { ActionButton, ChoiceChips, ErrorText } from "@/components/tool/FormControls";
import { CardGrid } from "@/components/tool/CardGrid";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { HeaderAction } from "@/features/roadmap/components/HeaderAction";
import { ActiveRoundBody, ActiveRoundFooter } from "@/features/confidence-builder/components/ActiveRound";
import { ConfidenceSetCard } from "@/features/confidence-builder/components/ConfidenceSetCard";
import { HistoryPanel } from "@/features/confidence-builder/components/HistoryPanel";
import { useConfidenceLog } from "@/features/confidence-builder/hooks/useConfidenceLog";
import { useConfidenceSets } from "@/features/confidence-builder/hooks/useConfidenceSets";

type Tab = "tasks" | "history";

const TABS = [
  { value: "tasks" as const, label: "Task sets" },
  { value: "history" as const, label: "History" },
];

const NEW_ROUTE = "/practice/confidence-builder/new";

export default function ConfidenceBuilderRoute() {
  const router = useRouter();
  const colors = useThemeColors();
  const [tab, setTab] = useState<Tab>("tasks");
  const sets = useConfidenceSets();
  const log = useConfidenceLog();
  const tasksTab = tab === "tasks";

  function openNew() {
    router.push(NEW_ROUTE as never);
  }

  return (
    <ToolScreen
      title="Confidence Builder"
      wide
      headerRight={
        tasksTab && sets.sets.length > 0 ? <HeaderAction icon={Plus} label="New task set" onPress={openNew} /> : undefined
      }
      footer={tasksTab && log.active ? <ActiveRoundFooter state={log} round={log.active} /> : undefined}
    >
      <View style={styles.body}>
        <ChoiceChips options={TABS} value={tab} onChange={setTab} />

        {!tasksTab ? (
          <HistoryPanel entries={log.entries} summary={log.summary} />
        ) : (
          <>
            <ErrorText message={sets.error} />
            <ErrorText message={log.saveError} />

            {log.active ? <ActiveRoundBody state={log} round={log.active} /> : null}

            {!sets.loaded ? <Text style={[typeScale.body, { color: colors.mutedForeground }]}>Loading your task sets…</Text> : null}

            {sets.loaded && sets.sets.length === 0 ? (
              <>
                <EmptyHint
                  icon={HeartHandshake}
                  title="No task sets yet"
                  hint="Choose an area to feel more confident in, and get small tasks to try."
                />
                <ActionButton label="New task set" icon={ListChecks} onPress={openNew} />
              </>
            ) : null}

            <CardGrid>
              {sets.sets.map((set) => (
                <ConfidenceSetCard
                  key={set.id}
                  set={set}
                  onOpen={() => router.push(`/practice/confidence-builder/${set.id}` as never)}
                />
              ))}
            </CardGrid>
          </>
        )}
      </View>
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.lg,
  },
});
