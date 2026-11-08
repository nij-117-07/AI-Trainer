// src/features/rss/components/viewer/ViewerFilters.tsx
/** Channel, category, search, and time-range controls for the RSS viewer. */
import { Panel, TextField } from "@/components/tool/FormControls";
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

  return (
    <Panel>
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
    </Panel>
  );
}
