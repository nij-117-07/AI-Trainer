// src/features/language-tester/components/LanguageTesterLinks.tsx
/** Landing cards for the Language Tester modes. The whole card opens its mode. The current mode is marked and is not a link. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Bot, ChevronRight, ClipboardCheck, Repeat, TextCursorInput, type LucideIcon } from "lucide-react-native";
import { cardPadding, shape, spacing, typeScale, useThemeColors, type Tone } from "@/theme";
import { CardGrid } from "@/components/tool/CardGrid";
import { pointerCursor } from "@/components/tool/FormControls";
import { FormWidth } from "./QuizParts";

interface LanguageTesterMode {
  title: string;
  description: string;
  icon: LucideIcon;
  tone: Tone;
  route?: string;
}

const MODES: LanguageTesterMode[] = [
  { title: "Assessment", description: "Multiple-choice quiz at your level", icon: ClipboardCheck, tone: "sky" },
  {
    title: "Translation challenge",
    description: "Translate or explain a sentence",
    icon: Repeat,
    tone: "amber",
    route: "/language-learner/language-tester/challenge",
  },
  {
    title: "Fill in the blanks",
    description: "Choose the missing word",
    icon: TextCursorInput,
    tone: "emerald",
    route: "/language-learner/language-tester/fib",
  },
  {
    title: "Roleplay coach",
    description: "Practice a conversation",
    icon: Bot,
    tone: "rose",
    route: "/language-learner/language-tester/roleplay",
  },
];

export function LanguageTesterLinks() {
  const colors = useThemeColors();
  const router = useRouter();

  return (
    <FormWidth>
      <CardGrid>
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const palette = colors.tone[mode.tone];
          const current = mode.route === undefined;
          return (
            <Pressable
              key={mode.title}
              onPress={() => router.push(mode.route as never)}
              disabled={current}
              accessibilityRole="link"
              accessibilityLabel={current ? `${mode.title}, current mode` : `Open ${mode.title}`}
              accessibilityState={{ selected: current, disabled: current }}
              style={({ pressed }) => [
                styles.card,
                pointerCursor,
                { borderColor: current ? colors.primary : colors.border, backgroundColor: colors.card },
                pressed && !current && { backgroundColor: colors.muted },
              ]}
            >
              <View style={[styles.tile, { backgroundColor: palette.bg }]}>
                <Icon size={22} color={palette.fg} />
              </View>
              <View style={styles.text}>
                <Text style={[typeScale.label, styles.title, { color: colors.foreground }]}>{mode.title}</Text>
                <Text style={[typeScale.body, { color: colors.mutedForeground }]}>{mode.description}</Text>
              </View>
              {!current && <ChevronRight size={18} color={colors.mutedForeground} />}
            </Pressable>
          );
        })}
      </CardGrid>
    </FormWidth>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: cardPadding.compact,
  },
  tile: {
    width: 40,
    height: 40,
    borderRadius: shape.md,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontWeight: "600",
  },
});
