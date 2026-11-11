// src/features/topic-suggestions/components/TopicListScreen.tsx
/** Topic Suggestions home: the saved topic list. Suggest topics is the one action, in the footer. */
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ListChecks, Sparkles } from "lucide-react-native";
import { spacing, typeScale, useThemeColors } from "@/theme";
import { ActionButton, ErrorText } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { useTopicList } from "../hooks/useTopicList";
import { TopicRow } from "./TopicRow";

export function TopicListScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const state = useTopicList();
  const doneCount = state.topics.filter((topic) => topic.done).length;

  return (
    <ToolScreen
      title="Topic Suggestions"
      footer={
        <ActionButton
          label="Suggest topics"
          icon={Sparkles}
          onPress={() => router.push("/learning/topic-suggestions/new" as never)}
        />
      }
    >
      <Section>
        <ErrorText message={state.error} />

        <View style={styles.header}>
          <SectionTitle icon={ListChecks} title="My topic list" />
          {state.topics.length > 0 ? (
            <Text style={[styles.count, { color: colors.mutedForeground }]}>
              {doneCount} of {state.topics.length} done
            </Text>
          ) : null}
        </View>

        {state.loaded && state.topics.length === 0 ? (
          <EmptyHint icon={ListChecks} title="Your list is empty" hint="Suggest some topics to study next." />
        ) : null}

        <View style={styles.list}>
          {state.topics.map((topic) => (
            <TopicRow
              key={topic.id}
              topic={topic}
              onToggle={() => state.toggle(topic.id)}
              onRemove={() => state.remove(topic.id)}
            />
          ))}
        </View>
      </Section>
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  count: {
    ...typeScale.caption,
  },
  list: {
    gap: spacing.sm,
  },
});
