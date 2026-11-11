// src/features/skill-architect/components/TreeEditor.tsx
/** Edit mode for a saved tree: rename levels and root skills, add skills, and remove skills. Saved only on Save. */
import { Pressable, StyleSheet, View } from "react-native";
import { Plus, X } from "lucide-react-native";
import { shape, spacing, touchTarget, useThemeColors } from "@/theme";
import { Panel, TextField } from "@/components/tool/FormControls";
import type { SkillLevel } from "../types";
import { SKILL_LIMITS } from "../lib/validate";

interface TreeEditorProps {
  levels: SkillLevel[];
  onChange: (levels: SkillLevel[]) => void;
}

export function TreeEditor({ levels, onChange }: TreeEditorProps) {
  const colors = useThemeColors();

  function patchLevel(levelIndex: number, patch: Partial<SkillLevel>) {
    onChange(levels.map((level, index) => (index === levelIndex ? { ...level, ...patch } : level)));
  }

  function setSkill(levelIndex: number, skillIndex: number, value: string) {
    const level = levels[levelIndex];
    patchLevel(levelIndex, {
      rootSkills: level.rootSkills.map((skill, index) => (index === skillIndex ? value : skill)),
    });
  }

  function removeSkill(levelIndex: number, skillIndex: number) {
    const level = levels[levelIndex];
    patchLevel(levelIndex, { rootSkills: level.rootSkills.filter((_, index) => index !== skillIndex) });
  }

  function addSkill(levelIndex: number) {
    const level = levels[levelIndex];
    patchLevel(levelIndex, { rootSkills: [...level.rootSkills, ""] });
  }

  return (
    <>
      {levels.map((level, levelIndex) => (
        <Panel key={levelIndex}>
          <TextField
            label={`Level ${levelIndex + 1} name`}
            value={level.levelName}
            onChangeText={(text) => patchLevel(levelIndex, { levelName: text })}
            maxLength={SKILL_LIMITS.topic}
          />

          {level.rootSkills.map((skill, skillIndex) => (
            <View key={skillIndex} style={styles.skillRow}>
              <View style={styles.skillField}>
                <TextField
                  label={`Root skill ${skillIndex + 1}`}
                  value={skill}
                  onChangeText={(text) => setSkill(levelIndex, skillIndex, text)}
                  maxLength={SKILL_LIMITS.topic}
                />
              </View>
              <Pressable
                onPress={() => removeSkill(levelIndex, skillIndex)}
                accessibilityRole="button"
                accessibilityLabel={`Remove root skill ${skillIndex + 1}`}
                style={({ pressed }) => [
                  styles.iconButton,
                  { borderColor: colors.border },
                  pressed && { backgroundColor: colors.muted },
                ]}
              >
                <X size={20} color={colors.foreground} />
              </Pressable>
            </View>
          ))}

          <Pressable
            onPress={() => addSkill(levelIndex)}
            accessibilityRole="button"
            accessibilityLabel={`Add root skill to level ${levelIndex + 1}`}
            style={({ pressed }) => [
              styles.addButton,
              { borderColor: colors.border },
              pressed && { backgroundColor: colors.muted },
            ]}
          >
            <Plus size={20} color={colors.foreground} />
          </Pressable>
        </Panel>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  skillRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  skillField: {
    flex: 1,
  },
  iconButton: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  addButton: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
});
