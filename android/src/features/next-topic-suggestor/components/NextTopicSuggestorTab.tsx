// src/features/next-topic-suggestor/components/NextTopicSuggestorTab.tsx
/** Next Topic Suggestor body: recommended next topics. The form lives in the footer. */
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Route, Sparkles } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { NextTopicSuggestorState } from "../hooks/useNextTopicSuggestor";
import { isTopicLevel, LIMITS, topicLevelOptions } from "../options";
import type { TopicRecommendation } from "../types";

export function NextTopicResults({ suggestor }: { suggestor: NextTopicSuggestorState }) {
  const colors = useThemeColors();
  const { result, pending } = suggestor;

  if (!result) {
    return (
      <EmptyHint
        icon={Route}
        title={pending ? "Finding next topics…" : "Your next topics"}
        hint={pending ? "This can take a moment." : "Describe your broader topic and what you already know in the form, then tap Suggest topics."}
      />
    );
  }

  return (
    <Section>
      <SectionTitle icon={Route} title="Recommended next topics" />
      {result.recommendations.length === 0 ? (
        <Text style={[styles.empty, { color: colors.mutedForeground }]}>No topic recommendations returned. Try again.</Text>
      ) : (
        result.recommendations.map((item, index) => (
          <RecommendationCard key={`${item.topicName}-${index}`} item={item} index={index} />
        ))
      )}
    </Section>
  );
}

export function NextTopicFooter({ suggestor }: { suggestor: NextTopicSuggestorState }) {
  const { form, pending, error, update, suggest } = suggestor;

  return (
    <View style={styles.footer}>
      <ScrollView style={styles.fields} contentContainerStyle={styles.fieldsContent} keyboardShouldPersistTaps="handled">
        <TextField
          label="Broader topic"
          placeholder="e.g. Cybersecurity"
          value={form.broaderTopic}
          onChangeText={(text) => update("broaderTopic", text)}
          editable={!pending}
          maxLength={LIMITS.broaderTopic}
        />
        <TextField
          label="Specific interest (optional)"
          placeholder="e.g. Web application security"
          value={form.specificInterest}
          onChangeText={(text) => update("specificInterest", text)}
          editable={!pending}
          maxLength={LIMITS.specificInterest}
        />
        <TextField
          label="Background knowledge"
          placeholder="What do you already know to build on?"
          value={form.learnedBefore}
          onChangeText={(text) => update("learnedBefore", text)}
          editable={!pending}
          maxLength={LIMITS.learnedBefore}
          multiline
          voice
          style={styles.compactInput}
        />
        <TextField
          label="Previously suggested topics (optional)"
          placeholder="One per line…"
          hint="These will not be repeated."
          value={form.previousSuggestions}
          onChangeText={(text) => update("previousSuggestions", text)}
          editable={!pending}
          maxLength={LIMITS.previousSuggestions}
          multiline
          style={styles.compactInput}
        />
        <TextField
          label="Custom input (optional)"
          placeholder="Specific constraints or requests…"
          value={form.customUserInput}
          onChangeText={(text) => update("customUserInput", text)}
          editable={!pending}
          maxLength={LIMITS.customUserInput}
          multiline
          voice
          style={styles.compactInput}
        />
        <SelectField
          label="Topic level"
          options={topicLevelOptions}
          value={form.topicLevel}
          onChange={(value) => {
            if (isTopicLevel(value)) update("topicLevel", value);
          }}
          allowCustom={false}
        />
      </ScrollView>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Finding next topics…" : "Suggest topics"}
        icon={Sparkles}
        loading={pending}
        onPress={suggest}
      />
    </View>
  );
}

function RecommendationCard({ item, index }: { item: TopicRecommendation; index: number }) {
  const colors = useThemeColors();
  return (
    <Panel>
      <View style={styles.cardHeader}>
        <View style={[styles.badge, { backgroundColor: colors.muted }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>{index + 1}</Text>
        </View>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>{item.topicName}</Text>
      </View>
      {item.reason !== "" && <Text style={[styles.reason, { color: colors.mutedForeground }]}>{item.reason}</Text>}
    </Panel>
  );
}

const styles = StyleSheet.create({
  footer: { gap: spacing.md },
  fields: { maxHeight: 360 },
  fieldsContent: { gap: spacing.md },
  compactInput: { minHeight: 72 },
  empty: { fontSize: 14, textAlign: "center", paddingVertical: spacing.md },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  badge: { width: 28, height: 28, borderRadius: radius.full / 2, alignItems: "center", justifyContent: "center" },
  badgeText: { fontSize: 14, fontWeight: "700" },
  cardTitle: { flex: 1, fontSize: 17, fontWeight: "600" },
  reason: { fontSize: 14, lineHeight: 21 },
});
