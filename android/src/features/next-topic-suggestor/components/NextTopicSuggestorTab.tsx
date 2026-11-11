// src/features/next-topic-suggestor/components/NextTopicSuggestorTab.tsx
/**
 * Next Topic Suggestor pages. The form page holds the fields in the body and the suggest action in
 * the footer. The result page holds a checklist of topics, and the footer shows how many are kept.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check, Route, Sparkles } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { ActionButton, ChoiceChips, ErrorText, Field, Panel, TextField } from "@/components/tool/FormControls";
import { CopyButton } from "@/components/tool/CopyButton";
import { ListenButton } from "@/components/tool/ListenButton";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { keptCount } from "@/lib/kept";
import type { NextTopicSuggestorState } from "../hooks/useNextTopicSuggestor";
import { LIMITS } from "../options";
import type { TopicLevel, TopicRecommendation } from "../types";

const TOPIC_LEVELS: TopicLevel[] = ["Beginner", "Intermediate", "Advanced"];

export function NextTopicForm({ suggestor }: { suggestor: NextTopicSuggestorState }) {
  const { form, pending, update } = suggestor;

  return (
    <>
      <Panel>
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
        <Field label="Topic level">
          <ChoiceChips
            options={TOPIC_LEVELS.map((level) => ({ value: level, label: level }))}
            value={form.topicLevel}
            onChange={(level) => update("topicLevel", level)}
          />
        </Field>
      </Panel>
      <Panel>
        <TextField
          label="What you already know"
          placeholder="e.g. Flask routing and SQL basics"
          value={form.learnedBefore}
          onChangeText={(text) => update("learnedBefore", text)}
          editable={!pending}
          maxLength={LIMITS.learnedBefore}
          multiline
          voice
          style={styles.compactInput}
        />
        <TextField
          label="Topics to skip (optional)"
          placeholder="One per line"
          value={form.previousSuggestions}
          onChangeText={(text) => update("previousSuggestions", text)}
          editable={!pending}
          maxLength={LIMITS.previousSuggestions}
          multiline
          style={styles.compactInput}
        />
        <TextField
          label="Other requests (optional)"
          placeholder="Constraints or requests…"
          value={form.customUserInput}
          onChangeText={(text) => update("customUserInput", text)}
          editable={!pending}
          maxLength={LIMITS.customUserInput}
          multiline
          voice
          style={styles.compactInput}
        />
      </Panel>
    </>
  );
}

export function NextTopicFormFooter({ suggestor, notice }: { suggestor: NextTopicSuggestorState; notice: string | null }) {
  const { pending, error, suggest } = suggestor;

  return (
    <View style={styles.footer}>
      <ErrorText message={error ?? notice} />
      <ActionButton
        label={pending ? "Finding next topics…" : "Suggest next topics"}
        icon={Sparkles}
        loading={pending}
        onPress={suggest}
      />
    </View>
  );
}

export function NextTopicResults({ topics, onToggle }: { topics: TopicRecommendation[]; onToggle: (index: number) => void }) {
  const colors = useThemeColors();
  const plain = topics.map((item) => (item.reason ? `${item.topicName}: ${item.reason}` : item.topicName)).join("\n");
  const keptTotal = keptCount(topics);

  return (
    <View style={styles.results}>
      <View style={styles.resultsHeader}>
        <View style={styles.resultsTitle}>
          <SectionTitle icon={Route} title="Suggested topics" />
        </View>
        <ListenButton text={plain} label="topics" />
        <CopyButton text={plain} label="Copy topics" />
      </View>
      {keptTotal > 0 ? (
        <View style={styles.status}>
          <Check size={14} color={colors.primary} />
          <Text style={[typeScale.caption, { color: colors.mutedForeground }]}>{keptTotal} kept</Text>
        </View>
      ) : null}
      <View style={[styles.list, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {topics.map((item, index) => (
          <TopicRow key={`${item.topicName}-${index}`} item={item} divided={index > 0} onToggle={() => onToggle(index)} />
        ))}
      </View>
    </View>
  );
}

export function NextTopicResultFooter({
  error,
  pending,
  onFindMore,
}: {
  error: string | null;
  pending: boolean;
  onFindMore: () => void;
}) {
  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton label="Find more" icon={Sparkles} loading={pending} onPress={onFindMore} />
    </View>
  );
}

function TopicRow({ item, divided, onToggle }: { item: TopicRecommendation; divided: boolean; onToggle: () => void }) {
  const colors = useThemeColors();
  const checked = item.kept;
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityLabel={`Keep ${item.topicName}`}
      accessibilityState={{ checked }}
      style={({ pressed }) => [
        styles.row,
        divided && { borderTopWidth: 1, borderTopColor: colors.border },
        pressed && { backgroundColor: colors.muted },
      ]}
    >
      <View
        style={[
          styles.check,
          { borderColor: checked ? colors.primary : colors.border, backgroundColor: checked ? colors.primary : colors.background },
        ]}
      >
        {checked ? <Check size={16} color={colors.primaryForeground} /> : null}
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.topic, { color: colors.foreground }]}>{item.topicName}</Text>
        {item.reason !== "" && <Text style={[styles.reason, { color: colors.mutedForeground }]}>{item.reason}</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  compactInput: { minHeight: 72 },
  footer: { gap: spacing.md },
  results: { gap: spacing.md },
  resultsHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  resultsTitle: { flex: 1 },
  status: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  list: { borderWidth: 1, borderRadius: shape.lg, overflow: "hidden" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  check: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderRadius: shape.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1, gap: spacing.xs },
  topic: { ...typeScale.body, fontWeight: "600" },
  reason: { ...typeScale.label, fontWeight: "400" },
});
