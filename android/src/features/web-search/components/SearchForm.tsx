// src/features/web-search/components/SearchForm.tsx
/** Search form: query, engine, result count, and a collapsible panel of advanced filters. */
import { useState, type Dispatch, type SetStateAction } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { ActionButton, ChoiceChips, ErrorText, Field, Panel, pointerCursor } from "@/components/tool/FormControls";
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
      <Field label="Search query">
        <View style={[styles.queryRow, { borderColor: colors.border, backgroundColor: colors.background }]}>
          <TextInput
            accessibilityLabel="Search query"
            placeholder="e.g. trail running shoes"
            placeholderTextColor={colors.mutedForeground}
            value={form.query}
            onChangeText={(text) => update("query", text)}
            onSubmitEditing={onSubmit}
            returnKeyType="search"
            editable={!pending}
            maxLength={300}
            autoCorrect={false}
            style={[styles.queryInput, { color: colors.foreground }]}
          />
          {form.query && !pending ? (
            <Pressable
              onPress={() => update("query", "")}
              accessibilityRole="button"
              accessibilityLabel="Clear search query"
              style={({ pressed }) => [styles.clearButton, pointerCursor, pressed && { backgroundColor: colors.muted }]}
            >
              <X size={20} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>
      </Field>

      <Field label="Engine">
        <ChoiceChips options={ENGINE_OPTIONS} value={form.engine} onChange={(value) => update("engine", value)} />
      </Field>

      {form.engine === "searxng" && (
        <Field label="SearXNG address" hint="Saved on this device.">
          <TextInput
            accessibilityLabel="SearXNG address"
            placeholder="http://192.168.1.20:8888"
            placeholderTextColor={colors.mutedForeground}
            value={searxngUrl}
            onChangeText={onSearxngUrlChange}
            editable={!pending}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={[styles.queryInput, styles.urlInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
          />
        </Field>
      )}

      <Field label="Results per search">
        <ChoiceChips
          options={RESULT_COUNT_OPTIONS}
          value={form.resultCount}
          onChange={(value) => update("resultCount", value)}
        />
      </Field>

      <Pressable
        onPress={() => setShowFilters((open) => !open)}
        accessibilityRole="button"
        accessibilityLabel="Advanced filters"
        accessibilityState={{ expanded: showFilters }}
        style={({ pressed }) => [styles.filterToggle, pointerCursor, pressed && { opacity: 0.85 }]}
      >
        <Text style={[styles.filterTitle, { color: colors.foreground }]}>Advanced filters</Text>
        {filtersActive && <Text style={[styles.badge, { color: colors.primary, borderColor: colors.primary }]}>Active</Text>}
        {showFilters ? <ChevronUp size={20} color={colors.mutedForeground} /> : <ChevronDown size={20} color={colors.mutedForeground} />}
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
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>Also applies to Load more.</Text>
        </View>
      )}

      <ActionButton label={pending ? "Searching…" : "Search web"} icon={Search} loading={pending} onPress={onSubmit} />
      <ErrorText message={error} />
    </Panel>
  );
}

const styles = StyleSheet.create({
  queryRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 56,
    borderWidth: 1,
    borderRadius: shape.lg,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
  },
  queryInput: {
    flex: 1,
    paddingVertical: spacing.md,
    ...typeScale.body,
  },
  urlInput: {
    minHeight: 56,
    borderWidth: 1,
    borderRadius: shape.lg,
    paddingHorizontal: spacing.lg,
  },
  clearButton: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
  filterToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: touchTarget,
  },
  filterTitle: {
    ...typeScale.label,
    fontWeight: "600",
  },
  badge: {
    ...typeScale.caption,
    borderWidth: 1,
    borderRadius: shape.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    overflow: "hidden",
  },
  filters: {
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  hint: {
    ...typeScale.caption,
  },
});
