# Creative Assets API

Base path: `/tools/creative_assets`
Tag: `Creative Assets`

## Endpoints

### `POST /tools/creative_assets/generate`

Generates high-impact creative marketing assets (product names, titles, hashtags, slogans, SEO titles) with explanations using DSPy.

**Request body** (`CreativeAssetRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `task_type` | `string` | ✅ | The type of asset to generate (e.g., "Product Names", "Hashtags", "SEO Titles", "Slogans") |
| `user_query` | `string` | ✅ | The primary topic, product description, or raw idea |
| `context` | `string` | ❌ | Target audience, tone, or specific marketing goals |
| `reference_examples` | `string[]` | ❌ | Existing titles/hashtags the user likes, used as style reference |
| `number_of_suggestions` | `int` | ❌ | Number of variations to generate (1-20, default: `3`) |

**Example request**:

```bash
curl -X POST http://localhost:8000/tools/creative_assets/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "task_type": "Product Hashtags",
    "user_query": "Eco-friendly bamboo toothbrushes",
    "context": "Targeting Gen Z on Instagram who care about zero-waste living.",
    "reference_examples": ["#SustainableLiving", "#GreenRoutine", "#PlasticFreeHome"],
    "number_of_suggestions": 3
  }'
```

**Response** (`CreativeAssetResponse`):

```json
{
  "suggestions": [
    {
      "suggestion": "#BrushWithPurpose",
      "explanation": "Combines the product action with a value-driven message..."
    },
    {
      "suggestion": "#ZeroWasteSmile",
      "explanation": "Pairs the zero-waste angle with a positive emotional outcome..."
    }
  ]
}
```

**Response fields** (`CreativeSuggestion` per item):

| Field | Type | Description |
|-------|------|-------------|
| `suggestion` | `string` | The generated name, title, or tag |
| `explanation` | `string` | Why this aligns with the user's preference and is effective |

---

## Error responses

All endpoints return a JSON body on failure.

| Status | Detail | Description |
|--------|--------|-------------|
| `401` | `Invalid or missing API key` | Missing/invalid `X-API-Key` header |
| `422` | `validation_error` | Pydantic request validation failed |
| `500` | `Failed to generate the creative assets.` | Internal AI processing failure |

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

### `CreativeAssetRecord`

Data contract for tracking a generation run (persistence not yet wired up).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique generation identifier |
| `task_type` | `string` | The type of asset to generate |
| `user_query` | `string` | The primary topic, product description, or raw idea |
| `context` | `string` | Target audience, tone, or marketing goals |
| `reference_examples` | `string[]` | Style reference examples |
| `number_of_suggestions` | `int` | Number of variations requested |
| `suggestions` | `object[]` | The generated assets |
| `created_at` | `datetime` | Record creation timestamp |
| `updated_at` | `datetime` | Last-updated timestamp |
| `is_active` | `bool` | Whether the record is active |
