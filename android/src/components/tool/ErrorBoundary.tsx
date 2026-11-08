// src/components/tool/ErrorBoundary.tsx
/**
 * Catches render errors in one part of a screen so the rest of the page keeps working.
 */
import { Component, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { spacing, useThemeColors } from "@/theme";
import { Panel } from "@/components/tool/FormControls";

interface ErrorBoundaryProps {
  children: ReactNode;
  label: string;
}

interface ErrorBoundaryState {
  failed: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error): void {
    console.warn(`${this.props.label} failed to render`, error);
  }

  render() {
    if (this.state.failed) {
      return <FailedPanel label={this.props.label} />;
    }
    return this.props.children;
  }
}

function FailedPanel({ label }: { label: string }) {
  const colors = useThemeColors();
  return (
    <Panel>
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.foreground }]}>{label} could not be displayed</Text>
        <Text style={[styles.text, { color: colors.mutedForeground }]}>
          Other questions still work. Try generating again, or reset this page.
        </Text>
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.xs,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
});
