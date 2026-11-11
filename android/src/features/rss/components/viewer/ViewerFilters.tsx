// src/features/rss/components/viewer/ViewerFilters.tsx
/** Channel, category, search, and time-range controls for the RSS viewer, folded into a disclosure that summarizes the active choices. */
import { SlidersHorizontal } from "lucide-react-native";
import { TextField } from "@/components/tool/FormControls";
import { Disclosure } from "@/components/tool/Disclosure";
import { SelectField } from "@/components/tool/SelectField";
import { ALL_CATEGORIES, ALL_FEEDS, TIME_RANGE_OPTIONS } from "../../options";
import type { RssFeedConfig, RssTimeRange, RssViewerFilters } from "../../types";

interface ViewerFiltersProps {
  feeds: RssFeedConfig[];
  filters: RssViewerFilters;
  categories: string[];
  onChange: <K extends keyof RssViewerFilters>(key: K, value: RssViewerFilters[K]) => void;
}

export function ViewerFilters({ feeds, filters, categories, onChange }: ViewerFiltersProps) {
  const channelOptions = [
    { value: ALL_FEEDS, label: "All channels" },
    ...feeds.map((feed) => ({ value: feed.id, label: feed.name })),
  ];
  const categoryOptions = [
    { value: ALL_CATEGORIES, label: "All categories" },
    ...categories.map((category) => ({ value: category, label: category })),
  ];

  const summary = [
    feeds.find((feed) => feed.id === filters.feedId)?.name ?? "All channels",
    filters.category === ALL_CATEGORIES ? "All categories" : filters.category,
    TIME_RANGE_OPTIONS.find((option) => option.value === filters.timeRange)?.label,
    filters.search ? `"${filters.search}"` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Disclosure title="Filters" icon={SlidersHorizontal} summary={summary}>
      <SelectField
        label="Channel"
        options={channelOptions}
        value={filters.feedId}
        onChange={(value) => onChange("feedId", value)}
        allowCustom={false}
      />
      <SelectField
        label="Category"
        options={categoryOptions}
        value={filters.category}
        onChange={(value) => onChange("category", value)}
        allowCustom={false}
      />
      <TextField
        label="Search"
        accessibilityLabel="Search articles"
        placeholder="Search articles…"
        value={filters.search}
        onChangeText={(text) => onChange("search", text)}
      />
      <SelectField
        label="Time range"
        options={TIME_RANGE_OPTIONS}
        value={filters.timeRange}
        onChange={(value) => onChange("timeRange", value as RssTimeRange)}
        allowCustom={false}
      />
    </Disclosure>
  );
}
