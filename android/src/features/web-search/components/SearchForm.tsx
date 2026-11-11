// src/features/web-search/components/SearchForm.tsx
/** Search form: query, engine, result count, and a collapsible panel of advanced filters. */
import { useState, type Dispatch, type SetStateAction } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronDown, ChevronUp, Search } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ChoiceChips, ErrorText, Field, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import {
  ENGINE_OPTIONS,
  RESULT_COUNT_OPTIONS,
  SAFE_SEARCH_OPTIONS,
  SEARCH_REGIONS,
  TIME_RANGE_OPTIONS,
  hasAdvancedFilters,
} from "../options";
import type { SearchFormValues } from "../types";

interface SearchFormProps {
  form: SearchFormValues;
  setForm: Dispatch<SetStateAction<SearchFormValues>>;
  searxngUrl: string;
  onSearxngUrlChange: (url: string) => void;
  pending: boolean;
  error: string | null;
  onSubmit: () => void;
}

export function SearchForm({ form, setForm, searxngUrl, onSearxngUrlChange, pending, error, onSubmit }: SearchFormProps) {
  const colors = useThemeColors();
  const [showFilters, setShowFilters] = useState(false);
  const filtersActive = hasAdvancedFilters(form);

  function update<K extends keyof SearchFormValues>(key: K, value: SearchFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Panel>
      <TextField
        label="Search the web"
        accessibilityLabel="Search query"
        placeholder="Search the web…"
        value={form.query}
        onChangeText={(text) => update("query", text)}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        editable={!pending}
        maxLength={300}
        autoCorrect={false}
      />

      <Field label="Engine">
        <ChoiceChips options={ENGINE_OPTIONS} value={form.engine} onChange={(value) => update("engine", value)} />
      </Field>

      {form.engine === "searxng" && (
        <TextField
          label="SearXNG address"
          accessibilityLabel="SearXNG address"
          placeholder="http://192.168.1.20:8888"
          hint="Your SearXNG instance, reachable from this phone. Saved on this device."
          value={searxngUrl}
          onChangeText={onSearxngUrlChange}
          editable={!pending}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
      )}

      <Field label="Number of results">
        <ChoiceChips
          options={RESULT_COUNT_OPTIONS}
          value={form.resultCount}
          onChange={(value) => update("resultCount", value)}
        />
      </Field>

      <Pressable
        onPress={() => setShowFilters((open) => !open)}
        accessibilityRole="button"
        accessibilityState={{ expanded: showFilters }}
        style={({ pressed }) => [styles.filterToggle, pressed && { opacity: 0.85 }]}
      >
        <Text style={[styles.filterTitle, { color: colors.foreground }]}>Advanced filters</Text>
        {filtersActive && <Text style={[styles.badge, { color: colors.primary, borderColor: colors.primary }]}>active</Text>}
        {showFilters ? <ChevronUp size={18} color={colors.mutedForeground} /> : <ChevronDown size={18} color={colors.mutedForeground} />}
      </Pressable>

      {showFilters && (
        <View style={[styles.filters, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <SelectField
            label="Region"
            options={SEARCH_REGIONS}
            value={form.region}
            onChange={(value) => update("region", value)}
            allowCustom={false}
          />
          <Field label="Time range">
            <ChoiceChips options={TIME_RANGE_OPTIONS} value={form.timeRange} onChange={(value) => update("timeRange", value)} />
          </Field>
          <Field label="Safe search">
            <ChoiceChips options={SAFE_SEARCH_OPTIONS} value={form.safeSearch} onChange={(value) => update("safeSearch", value)} />
          </Field>
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            Filters apply to the whole search, including pages loaded with “Load more”.
          </Text>
        </View>
      )}

      <ActionButton label={pending ? "Searching…" : "Search"} icon={Search} loading={pending} onPress={onSubmit} />
      <ErrorText message={error} />
    </Panel>
  );
}

const styles = StyleSheet.create({
  filterToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 44,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  badge: {
    fontSize: 11,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    overflow: "hidden",
  },
  filters: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
});
