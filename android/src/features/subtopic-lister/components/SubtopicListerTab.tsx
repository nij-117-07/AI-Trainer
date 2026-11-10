// src/features/subtopic-lister/components/SubtopicListerTab.tsx
/** Subtopic Lister body: what the learner has finished at the top, suggested next subtopics below. */
import { StyleSheet, Text, View } from "react-native";
import { BookOpen, ListTree, Sparkles } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { TagList } from "@/components/tool/TagList";
import type { SubtopicListerState } from "../hooks/useSubtopicLister";
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
          hint="Tap Suggest next subtopics below. The AI picks what to study next from what you have finished."
        />
      )}
    </Section>
  );
}

export function SubtopicFooter({ lister }: { lister: SubtopicListerState }) {
  return (
    <View style={styles.footer}>
      <ErrorText message={lister.error} />
      <ActionButton
        label={lister.pending ? "Finding subtopics…" : "Suggest next subtopics"}
        icon={Sparkles}
        loading={lister.pending}
        onPress={lister.suggest}
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
