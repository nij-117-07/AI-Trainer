// src/features/web-search/components/WebSearchTool.tsx
/** Web Search tool: the search form on top, then result cards with a Load more pager. */
import { useState, type ReactNode } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Globe, ListPlus, SearchX } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, Panel } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { DEFAULT_FORM, hasAdvancedFilters } from "../options";
import { useSearxngUrl } from "../hooks/useSearxngUrl";
import { useWebSearch } from "../hooks/useWebSearch";
import type { SearchFormValues } from "../types";
import { SearchForm } from "./SearchForm";
import { SearchResultCard } from "./SearchResultCard";

export function WebSearchTool() {
  const colors = useThemeColors();
  const [form, setForm] = useState<SearchFormValues>(DEFAULT_FORM);
  const { searxngUrl, setSearxngUrl } = useSearxngUrl();
  const { results, meta, isPending, error, submit, loadMore } = useWebSearch(searxngUrl);

  function handleSearch() {
    void submit(form);
  }

  function handleLoadMore() {
    void loadMore();
  }

  return (
    <Section>
      <SearchForm
        form={form}
        setForm={setForm}
        searxngUrl={searxngUrl}
        onSearxngUrlChange={setSearxngUrl}
        pending={isPending}
        error={error}
        onSubmit={handleSearch}
      />

      {isPending && results.length === 0 ? (
        <StatePanel>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.body, { color: colors.mutedForeground }]}>Searching…</Text>
        </StatePanel>
      ) : results.length > 0 && meta ? (
        <Section>
          <Text style={[styles.summary, { color: colors.mutedForeground }]}>
            {results.length} result{results.length === 1 ? "" : "s"} for “{meta.values.query}”
            {meta.page > 1 ? ` · pages 1–${meta.page}` : ""}
            {hasAdvancedFilters(meta.values) ? " · filtered" : ""}
          </Text>
          {results.map((item, index) => (
            <SearchResultCard key={`${item.url}-${index}`} result={item} rank={index + 1} />
          ))}
          {meta.hasMore && (
            <ActionButton
              label={isPending ? "Loading more…" : "Load more results"}
              icon={ListPlus}
              variant="outline"
              loading={isPending}
              onPress={handleLoadMore}
            />
          )}
        </Section>
      ) : meta ? (
        <StatePanel>
          <SectionTitle icon={SearchX} title="No results found" />
          <Text style={[styles.body, { color: colors.mutedForeground }]}>
            Nothing matched that query with the current filters. Try different words or widen the filters.
          </Text>
        </StatePanel>
      ) : (
        <StatePanel>
          <SectionTitle icon={Globe} title="Search the web" />
          <Text style={[styles.body, { color: colors.mutedForeground }]}>
            Type a query above to find pages, posts, and docs. Results link straight to their sources.
          </Text>
        </StatePanel>
      )}
    </Section>
  );
}

function StatePanel({ children }: { children: ReactNode }) {
  return (
    <Panel>
      <View style={styles.statePanel}>{children}</View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  summary: {
    fontSize: 13,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  statePanel: {
    gap: spacing.md,
  },
});
