// src/features/debate/components/PersonaCard.tsx
/**
 * One debater's persona. The profile shows at a glance; Edit opens an inline editor for every
 * field, and Regenerate builds a new persona from the form values for this side.
 */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Pencil, RefreshCw } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, Panel, TextField } from "@/components/tool/FormControls";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { SelectField } from "@/components/tool/SelectField";
import { STANCE_OPTIONS } from "../options";
import { textList } from "../lib/text";
import type { DebateSide, PersonaProfile, RhetoricalStance } from "../types";

interface PersonaCardProps {
  side: DebateSide;
  persona: PersonaProfile;
  topic: string;
  busy: boolean;
  regenPending: boolean;
  onSave: (persona: PersonaProfile) => void;
  onRegenerate: () => void;
}

interface PersonaDraft {
  name: string;
  stance: string;
  priorities: string;
  values: string;
  quirks: string;
  prompt: string;
}

function toDraft(persona: PersonaProfile): PersonaDraft {
  return {
    name: persona.personaName,
    stance: persona.overallStance,
    priorities: textList(persona.strategicPriorities).join("\n"),
    values: textList(persona.coreValues).join("\n"),
    quirks: textList(persona.linguisticQuirks).join("\n"),
    prompt: persona.systemPrompt,
  };
}

function toList(raw: string): string[] {
  return raw
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function PersonaCard({ side, persona, topic, busy, regenPending, onSave, onRegenerate }: PersonaCardProps) {
  const colors = useThemeColors();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<PersonaDraft>(() => toDraft(persona));
  const isPro = side === "pro";
  const palette = isPro ? colors.tone.emerald : colors.tone.rose;

  function update<K extends keyof PersonaDraft>(key: K, value: PersonaDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function startEdit() {
    setDraft(toDraft(persona));
    setEditing(true);
  }

  function save() {
    onSave({
      personaName: draft.name.trim() || persona.personaName,
      overallStance: draft.stance as RhetoricalStance,
      strategicPriorities: toList(draft.priorities),
      coreValues: toList(draft.values),
      linguisticQuirks: toList(draft.quirks),
      systemPrompt: draft.prompt.trim() || persona.systemPrompt,
    });
    setEditing(false);
  }

  return (
    <Panel>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: palette.bg, borderColor: palette.border }]}>
          <Text style={[styles.badgeText, { color: palette.fg }]}>{isPro ? "Pro" : "Con"}</Text>
        </View>
        <Text style={[styles.name, { color: colors.foreground }]}>{persona.personaName || "Unnamed persona"}</Text>
      </View>
      <Text style={[styles.note, { color: colors.mutedForeground }]}>
        {isPro ? "For" : "Against"}: <Text style={{ color: colors.foreground }}>{topic}</Text>
      </Text>

      {editing ? (
        <>
          <TextField label="Name" value={draft.name} onChangeText={(text) => update("name", text)} maxLength={200} />
          <SelectField
            label="Overall stance"
            options={STANCE_OPTIONS}
            value={draft.stance}
            onChange={(value) => update("stance", value)}
            allowCustom={false}
          />
          <TextField
            label="Strategic priorities"
            hint="One per line"
            value={draft.priorities}
            onChangeText={(text) => update("priorities", text)}
            multiline
            maxLength={2000}
          />
          <TextField
            label="Core values"
            hint="One per line"
            value={draft.values}
            onChangeText={(text) => update("values", text)}
            multiline
            maxLength={2000}
          />
          <TextField
            label="Linguistic quirks"
            hint="One per line"
            value={draft.quirks}
            onChangeText={(text) => update("quirks", text)}
            multiline
            maxLength={2000}
          />
          <TextField
            label="System prompt"
            value={draft.prompt}
            onChangeText={(text) => update("prompt", text)}
            multiline
            maxLength={8000}
          />
          <ActionButton label="Save persona" onPress={save} />
          <ActionButton label="Cancel" variant="outline" onPress={() => setEditing(false)} />
        </>
      ) : (
        <>
          <Detail title="Stance" text={persona.overallStance} />
          <ListBlock title="Strategic priorities" items={textList(persona.strategicPriorities)} />
          <ListBlock title="Core values" items={textList(persona.coreValues)} />
          <ListBlock title="Linguistic quirks" items={textList(persona.linguisticQuirks)} />
          <ActionButton
            label="Edit persona"
            icon={Pencil}
            variant="outline"
            onPress={() => {
              if (!busy) startEdit();
            }}
          />
          <ActionButton
            label={regenPending ? "Regenerating…" : "Regenerate with AI"}
            icon={RefreshCw}
            variant="outline"
            loading={regenPending}
            onPress={() => {
              if (!busy) onRegenerate();
            }}
          />
        </>
      )}
    </Panel>
  );
}

function Detail({ title, text }: { title: string; text: string }) {
  const colors = useThemeColors();
  const shown = text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
  return (
    <View style={styles.block}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{title}</Text>
      <Text style={[styles.body, { color: colors.foreground }]}>{shown}</Text>
    </View>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  const colors = useThemeColors();
  if (items.length === 0) return null;
  return (
    <View style={styles.block}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{title}</Text>
      <MarkdownText content={items.map((item) => `- ${item}`).join("\n")} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  badge: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  name: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  note: {
    fontSize: 13,
    lineHeight: 19,
  },
  block: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
});
