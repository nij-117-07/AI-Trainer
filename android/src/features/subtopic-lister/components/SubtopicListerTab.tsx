/** Subtopic Lister: break a topic into ordered subtopics for a chosen level. */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ListTree, RefreshCcw } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { CountSlider } from "@/components/tool/CountSlider";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRequest } from "@/hooks/useRequest";
import { listSubtopics } from "../lib/generators";
import { DEFAULT_COUNT, MAX_COUNT, MIN_COUNT, TOPIC_MAX } from "../lib/validate";
import { subtopicLevelOptions } from "../options";
import type { Subtopic, SubtopicFormValues } from "../types";

const DEFAULTS: SubtopicFormValues = {
  topic: "",
  level: "beginner",
  count: DEFAULT_COUNT,
};

export function SubtopicListerTab() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const request = useRequest(listSubtopics);
  const [form, setForm] = useState<SubtopicFormValues>(DEFAULTS);

  const update = <K extends keyof SubtopicFormValues>(key: K, value: SubtopicFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  function reset() {
    setForm(DEFAULTS);
    request.reset();
  }

  const result = request.data;

  return (
    <Section>
      <Panel>
        <TextField
          label="Topic"
          placeholder="e.g. Machine learning"
          value={form.topic}
          onChangeText={(text) => update("topic", text)}
          editable={!request.pending}
          maxLength={TOPIC_MAX}
        />
        <SelectField
          label="Level"
          options={subtopicLevelOptions}
          value={form.level}
          onChange={(value) => update("level", value as SubtopicFormValues["level"])}
          allowCustom={false}
        />
        <CountSlider
          label="Number of subtopics"
          min={MIN_COUNT}
          max={MAX_COUNT}
          value={form.count}
          onChange={(value) => update("count", value)}
        />
        <ActionButton
          label={request.pending ? "Listing subtopics…" : "List subtopics"}
          icon={ListTree}
          loading={request.pending}
          onPress={() => request.run(settings, form)}
        />
      </Panel>

      <ErrorText message={request.error} />

      {result && (
        <>
          <SectionTitle icon={ListTree} title={`Subtopics of ${result.topic}`} />
          {result.subtopics.length === 0 ? (
            <Text style={[styles.empty, { color: colors.mutedForeground }]}>No subtopics returned.</Text>
          ) : (
            result.subtopics.map((item, index) => <SubtopicCard key={`${item.name}-${index}`} item={item} index={index} />)
          )}
        </>
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={reset} />
    </Section>
  );
}

function SubtopicCard({ item, index }: { item: Subtopic; index: number }) {
  const colors = useThemeColors();
  return (
    <Panel>
      <View style={styles.cardHeader}>
        <View style={[styles.badge, { backgroundColor: colors.muted }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>{index + 1}</Text>
        </View>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>{item.name}</Text>
      </View>
      {item.description.trim() !== "" && (
        <Text style={[styles.description, { color: colors.mutedForeground }]}>{item.description.trim()}</Text>
      )}
    </Panel>
  );
}

const styles = StyleSheet.create({
  empty: { fontSize: 14, textAlign: "center", paddingVertical: spacing.md },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  badge: { width: 28, height: 28, borderRadius: radius.full / 2, alignItems: "center", justifyContent: "center" },
  badgeText: { fontSize: 14, fontWeight: "700" },
  cardTitle: { flex: 1, fontSize: 17, fontWeight: "600" },
  description: { fontSize: 14, lineHeight: 21 },
});
