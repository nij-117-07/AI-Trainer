// src/features/testing-portal/components/SolverResultCard.tsx
import { StyleSheet, Text } from "react-native";
import { CircleCheck } from "lucide-react-native";
import { typeScale, useThemeColors } from "@/theme";
import { ListenButton } from "@/components/tool/ListenButton";
import { ResultCallout } from "@/components/tool/ResultCallout";
import type { SolverResult } from "../types";

export function SolverResultCard({ result }: { result: SolverResult }) {
  const colors = useThemeColors();
  return (
    <ResultCallout icon={CircleCheck} title={`Model answer: ${result.correctOption}`} tone="emerald">
      <Text selectable style={[styles.body, { color: colors.foreground }]}>
        {result.reasoning}
      </Text>
      <ListenButton text={result.reasoning} label="Reasoning" />
    </ResultCallout>
  );
}

const styles = StyleSheet.create({
  body: {
    ...typeScale.body,
  },
});
