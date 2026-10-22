# Chart.js Generator API

Base path: `/tools/charts`
Tag: `Chart.js Generator`

## Endpoints

### `POST /tools/charts/generate`

Generates a Chart.js HTML/JS visualization from raw data and user instructions. Chart.js is assumed to be installed via npm in the consuming frontend.

**Request body** (`ChartRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `data_input` | `any` | ✅ | The raw data (JSON, CSV, or text) to be visualized |
| `custom_instructions` | `string` | ✅ | Preferences for chart type, colors, labels, etc. |
| `previous_code` | `string` | ❌ | Existing Chart.js code to refactor or update |

**Example request**:

```bash
curl -X POST http://localhost:8000/tools/charts/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "data_input": [
      { "label": "Jan", "value": 12 },
      { "label": "Feb", "value": 19 },
      { "label": "Mar", "value": 3 }
    ],
    "custom_instructions": "Bar chart, blue bars, dark theme, rounded corners."
  }'
```

**Response** (`ChartResponse`):

```json
{
  "answer_message": "I created a bar chart ...",
  "chart_div_code": "<div><canvas id=\"myChart\"></canvas><script>...</script></div>",
  "status": "success"
}
```

**Response fields**:

| Field | Type | Description |
|-------|------|-------------|
| `answer_message` | `string` | A brief explanation of the chart created and how to use it |
| `chart_div_code` | `string` | The full HTML/JS block containing `<div>`, `<canvas>`, and Chart.js logic |
| `status` | `string` | Processing status (default: `success`) |

---

## Error responses

All endpoints return a JSON body on failure.

| Status | Detail | Description |
|--------|--------|-------------|
| `401` | `Invalid or missing API key` | Missing/invalid `X-API-Key` header |
| `422` | `validation_error` | Pydantic request validation failed |
| `500` | `Failed to generate the chart.` | Internal AI processing failure |

## Authentication

Optional `X-API-Key` header. When `API_KEY` is set in the environment, the server rejects requests without a matching key. When blank, the guard is disabled.

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `LLM_MODEL_NAME` | `gpt-4o-mini` | Model passed to DSPy |
| `LLM_API_KEY` | *(empty)* | Provider API key |
| `LLM_API_BASE` | `https://api.openai.com/v1` | OpenAI-compatible base URL |
| `LLM_TEMPERATURE` | `0.7` | Sampling temperature |

---

## Shared models

### `ChartRecord`

Data contract for tracking a generated chart (persistence not yet wired up).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique chart generation identifier |
| `data_input` | `any` | The raw data used to build the chart |
| `custom_instructions` | `string` | User preferences for the chart |
| `previous_code` | `string` | Prior Chart.js code that was modified |
| `answer_message` | `string` | Explanation of the generated chart |
| `chart_div_code` | `string` | The generated HTML/JS code block |
| `created_at` | `datetime` | Record creation timestamp |
| `updated_at` | `datetime` | Last-updated timestamp |
| `is_active` | `bool` | Whether the record is active |
