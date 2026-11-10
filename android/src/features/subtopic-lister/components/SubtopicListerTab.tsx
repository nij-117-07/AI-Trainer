// src/features/subtopic-lister/components/SubtopicListerTab.tsx
/** Subtopic Lister body: what the learner has finished at the top, suggested subtopics below. The form lives in the footer. */
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { BookOpen, ListTree, Sparkles } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { TagList } from "@/components/tool/TagList";
import type { SubtopicListerState } from "../hooks/useSubtopicLister";
import { INSTRUCTIONS_MAX, isSubtopicLevel, subtopicLevelOptions, TOPIC_MAX } from "../options";
import type { LearnedTopic, Subtopic } from "../types";

export function SubtopicListerTab({ lister }: { lister: SubtopicListerState }) {
  const { learned, result } = lister;

  return (
    <Section>
      <LearnedPanel learned={learned} />

      {result ? (
        <>
          <SectionTitle icon={ListTree} title="Suggested next subtopics" />
          {result.subtopics.length === 0 ? (
            <Text style={styles.empty}>No subtopics returned. Try again.</Text>
          ) : (
            result.subtopics.map((item, index) => <SubtopicCard key={`${item.name}-${index}`} item={item} index={index} />)
          )}
        </>
      ) : (
        <EmptyHint
          icon={ListTree}
          title="Your next subtopics"
          hint="Pick a topic and level in the form below, then tap Suggest. Leave the topic empty to continue from what you have finished."
        />
      )}
    </Section>
  );
}

export function SubtopicFooter({ lister }: { lister: SubtopicListerState }) {
  const { form, pending, error, update, suggest } = lister;

  return (
    <View style={styles.footer}>
      <ScrollView style={styles.fields} contentContainerStyle={styles.fieldsContent} keyboardShouldPersistTaps="handled">
        <TextField
          label="Topic (optional)"
          placeholder="e.g. Machine learning, or leave empty"
          value={form.topic}
          onChangeText={(text) => update("topic", text)}
          editable={!pending}
          maxLength={TOPIC_MAX}
        />
        <SelectField
          label="Level"
          options={subtopicLevelOptions}
          value={form.level}
          onChange={(value) => {
            if (isSubtopicLevel(value)) update("level", value);
          }}
          allowCustom={false}
        />
        <TextField
          label="Last topics learnt or custom instructions (optional)"
          placeholder="e.g. I just finished loops. Or prefer examples over theory."
          value={form.instructions}
          onChangeText={(text) => update("instructions", text)}
          editable={!pending}
          maxLength={INSTRUCTIONS_MAX}
          multiline
          voice
          style={styles.compactInput}
        />
      </ScrollView>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Finding subtopics…" : "Suggest subtopics"}
        icon={Sparkles}
        loading={pending}
        onPress={suggest}
      />
    </View>
  );
}

function LearnedPanel({ learned }: { learned: LearnedTopic[] | null }) {
  const colors = useThemeColors();
  if (learned === null) return null;

  return (
    <Panel>
      <SectionTitle icon={BookOpen} title="What you've learned" />
      {learned.length === 0 ? (
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          Nothing is marked as done yet. Tick off items in your roadmaps and they will appear here.
        </Text>
      ) : (
        learned.map((topic) => (
          <View key={topic.subject} style={styles.topic}>
            <Text style={[styles.subject, { color: colors.foreground }]}>{topic.subject}</Text>
            <TagList items={topic.items} />
          </View>
        ))
      )}
    </Panel>
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
  footer: { gap: spacing.md },
  fields: { maxHeight: 340 },
  fieldsContent: { gap: spacing.md },
  compactInput: { minHeight: 72 },
  topic: { gap: spacing.sm },
  subject: { fontSize: 15, fontWeight: "600" },
  hint: { fontSize: 14, lineHeight: 20 },
  empty: { fontSize: 14, textAlign: "center", paddingVertical: spacing.md },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  badge: { width: 28, height: 28, borderRadius: radius.full / 2, alignItems: "center", justifyContent: "center" },
  badgeText: { fontSize: 14, fontWeight: "700" },
  cardTitle: { flex: 1, fontSize: 17, fontWeight: "600" },
  description: { fontSize: 14, lineHeight: 21 },
});
