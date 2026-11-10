// src/features/topic-suggestions/components/TopicListScreen.tsx
/** Topic Suggestions home: the saved topic list, with a Suggest topics button that opens the generator. */
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ListChecks, Sparkles } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
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
    <ToolScreen title="Topic Suggestions">
      <Section>
        <Text style={[styles.lead, { color: colors.mutedForeground }]}>
          Keep a list of topics to study next. Suggest new ones, then add the ones you want.
        </Text>

        <ActionButton
          label="Suggest topics"
          icon={Sparkles}
          onPress={() => router.push("/learning/topic-suggestions/new" as never)}
        />

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
          <EmptyHint
            icon={ListChecks}
            title="Your list is empty"
            hint="Tap Suggest topics, pick the ones you want, and they will appear here."
          />
        ) : null}

        {state.topics.map((topic) => (
          <TopicRow
            key={topic.id}
            topic={topic}
            onToggle={() => state.toggle(topic.id)}
            onRemove={() => state.remove(topic.id)}
          />
        ))}
      </Section>
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  lead: {
    fontSize: 14,
    lineHeight: 21,
    paddingHorizontal: spacing.xs,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  count: {
    fontSize: 12,
  },
});
