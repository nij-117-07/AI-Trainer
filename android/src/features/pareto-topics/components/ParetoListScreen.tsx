// src/features/pareto-topics/components/ParetoListScreen.tsx
/** 80/20 Topics home: every saved topic list as a compact row. New list is in the top bar, or the empty state. */
import { useCallback } from "react";
import { StyleSheet, Text } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { ListChecks, Plus } from "lucide-react-native";
import { typeScale, useThemeColors } from "@/theme";
import { ActionButton, ErrorText } from "@/components/tool/FormControls";
import { CardGrid } from "@/components/tool/CardGrid";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { HeaderAction } from "@/features/roadmap/components/HeaderAction";
import { useParetoLists } from "../hooks/useParetoLists";
import { ParetoListCard } from "./ParetoListCard";

export function ParetoListScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { lists, loaded, error, reload } = useParetoLists();

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  function openList(id: string) {
    router.push(`/learning/pareto-topics/${id}` as never);
  }

  function openNew() {
    router.push("/learning/pareto-topics/new" as never);
  }

  return (
    <ToolScreen
      title="80/20 Topics"
      wide
      headerRight={lists.length > 0 ? <HeaderAction icon={Plus} label="New topic list" onPress={openNew} /> : undefined}
    >
      <Section>
        <ErrorText message={error} />

        {!loaded ? <Text style={[styles.muted, { color: colors.mutedForeground }]}>Loading your topic lists…</Text> : null}

        {loaded && lists.length === 0 ? (
          <>
            <EmptyHint
              icon={ListChecks}
              title="No topic lists yet"
              hint="Find the few topics that cover most of the work in a field, then tick off the ones you keep."
            />
            <ActionButton label="New topic list" icon={Plus} onPress={openNew} />
          </>
        ) : null}

        <CardGrid>
          {lists.map((list) => (
            <ParetoListCard key={list.id} list={list} onOpen={() => openList(list.id)} />
          ))}
        </CardGrid>
      </Section>
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  muted: {
    ...typeScale.body,
  },
});
