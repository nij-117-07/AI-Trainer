// src/components/tool/MarkdownText.tsx
/** Renders model output that may contain Markdown. Styles follow the active theme. */
import { ScrollView, StyleSheet, Text, View, type TextStyle } from "react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { parseInline, parseMarkdown, type MarkdownBlock } from "@/lib/markdown";

interface MarkdownTextProps {
  content: string;
  selectable?: boolean;
}

export function MarkdownText({ content, selectable = true }: MarkdownTextProps) {
  const blocks = parseMarkdown(content);
  return (
    <View style={styles.stack}>
      {blocks.map((block, index) => (
        <BlockView key={index} block={block} selectable={selectable} />
      ))}
    </View>
  );
}

function BlockView({ block, selectable }: { block: MarkdownBlock; selectable: boolean }) {
  const colors = useThemeColors();

  switch (block.type) {
    case "heading": {
      const size = block.level <= 2 ? 20 : block.level === 3 ? 17 : 15;
      return (
        <Inline
          text={block.text}
          selectable={selectable}
          style={[styles.heading, { fontSize: size, color: colors.foreground }]}
        />
      );
    }
    case "paragraph":
      return <Inline text={block.text} selectable={selectable} style={[styles.body, { color: colors.foreground }]} />;
    case "bullets":
    case "numbered":
      return (
        <View style={styles.list}>
          {block.items.map((item, index) => (
            <View key={index} style={styles.listRow}>
              <Text style={[styles.marker, { color: colors.mutedForeground }]}>
                {block.type === "bullets" ? "•" : `${index + 1}.`}
              </Text>
              <Inline
                text={item}
                selectable={selectable}
                style={[styles.body, styles.listText, { color: colors.foreground }]}
              />
            </View>
          ))}
        </View>
      );
    case "quote":
      return (
        <View style={[styles.quote, { borderLeftColor: colors.primary }]}>
          <Inline text={block.text} selectable={selectable} style={[styles.body, { color: colors.mutedForeground }]} />
        </View>
      );
    case "code":
      return (
        <View style={[styles.code, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator>
            <Text selectable={selectable} style={[styles.codeText, { color: colors.foreground }]}>
              {block.text}
            </Text>
          </ScrollView>
        </View>
      );
  }
}

function Inline({ text, style, selectable }: { text: string; style: TextStyle[]; selectable: boolean }) {
  const colors = useThemeColors();
  return (
    <Text selectable={selectable} style={style}>
      {parseInline(text).map((segment, index) => (
        <Text
          key={index}
          style={[
            segment.bold && styles.bold,
            segment.italic && styles.italic,
            segment.code && styles.inlineCode,
            segment.code && { backgroundColor: colors.muted },
          ]}
        >
          {segment.text}
        </Text>
      ))}
    </Text>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
  heading: {
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
  },
  list: {
    gap: spacing.sm,
  },
  listRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  marker: {
    fontSize: 15,
    lineHeight: 23,
    minWidth: 20,
  },
  listText: {
    flex: 1,
  },
  quote: {
    borderLeftWidth: 3,
    paddingLeft: spacing.md,
  },
  code: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  codeText: {
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: 19,
  },
  bold: {
    fontWeight: "700",
  },
  italic: {
    fontStyle: "italic",
  },
  inlineCode: {
    fontFamily: "monospace",
  },
});
