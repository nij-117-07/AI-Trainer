// src/features/web-search/components/WebSearchTool.tsx
/** Web Search tool: the search form that opens on tap, then result cards with a Load more pager. */
import { useEffect, type ReactNode } from "react";
import { usePersistedState } from "@/hooks/usePersistedState";
import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";
import { Globe, ListPlus, SearchX } from "lucide-react-native";
import { spacing, typeScale, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel } from "@/components/tool/FormControls";
import { CardGrid } from "@/components/tool/CardGrid";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { SettingsToggle } from "@/components/tool/SettingsToggle";
import { useCollapsibleForm } from "@/hooks/useCollapsibleForm";
import { DEFAULT_FORM, SEARCH_FORM_KEY, hasAdvancedFilters } from "../options";
import { useSearxngUrl } from "../hooks/useSearxngUrl";
import { useWebSearch } from "../hooks/useWebSearch";
import type { SearchFormValues } from "../types";
import { SearchForm } from "./SearchForm";
import { SearchResultCard } from "./SearchResultCard";

export function WebSearchTool() {
  const colors = useThemeColors();
  const [form, setForm] = usePersistedState<SearchFormValues>(SEARCH_FORM_KEY, DEFAULT_FORM);
  const { searxngUrl, setSearxngUrl } = useSearxngUrl();
  const { results, meta, isPending, error, submit, loadMore } = useWebSearch(searxngUrl);
  const panel = useCollapsibleForm(results.length > 0);

  useEffect(() => {
    if (meta) panel.reset();
  }, [meta]);

  if (Platform.OS === "web") {
    return (
      <StatePanel>
        <SectionTitle icon={Globe} title="Use the Android app to search" />
        <Text style={[styles.body, { color: colors.mutedForeground }]}>
          Browsers block direct search requests (CORS).
        </Text>
      </StatePanel>
    );
  }

  function handleSearch() {
    void submit(form);
  }

  function handleLoadMore() {
    void loadMore();
  }

  return (
    <Section>
      <SettingsToggle
        title="Search form"
        summary={form.query.trim() || "Query and filters"}
        expanded={panel.expanded}
        onToggle={panel.toggle}
      />
      <ErrorText message={panel.expanded ? null : error} />

      {panel.expanded ? (
        <SearchForm
          form={form}
          setForm={setForm}
          searxngUrl={searxngUrl}
          onSearxngUrlChange={setSearxngUrl}
          pending={isPending}
          error={error}
          onSubmit={handleSearch}
        />
      ) : null}

      {isPending && results.length === 0 ? (
        <StatePanel>
          <ActivityIndicator color={colors.primary} accessibilityLabel="Searching" />
          <Text accessibilityLiveRegion="polite" style={[styles.body, { color: colors.mutedForeground }]}>
            Searching…
          </Text>
        </StatePanel>
      ) : results.length > 0 && meta ? (
        <Section>
          <Text accessibilityLiveRegion="polite" style={[styles.summary, { color: colors.mutedForeground }]}>
            {results.length} result{results.length === 1 ? "" : "s"} for “{meta.values.query}”
            {meta.page > 1 ? ` · pages 1–${meta.page}` : ""}
            {hasAdvancedFilters(meta.values) ? " · filtered" : ""}
          </Text>
          <CardGrid>
            {results.map((item, index) => (
              <SearchResultCard key={`${item.url}-${index}`} result={item} rank={index + 1} />
            ))}
          </CardGrid>
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
          <Text accessibilityLiveRegion="polite" style={[styles.body, { color: colors.mutedForeground }]}>
            Try different words or change the filters.
          </Text>
        </StatePanel>
      ) : (
        <Text style={[styles.body, { color: colors.mutedForeground }]}>Results will appear here.</Text>
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
    ...typeScale.caption,
  },
  body: {
    ...typeScale.body,
  },
  statePanel: {
    gap: spacing.md,
  },
});
