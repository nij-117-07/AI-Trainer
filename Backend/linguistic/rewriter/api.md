# Rewriter API

Base path: `/linguistic/rewriter`
Tag: `Content Tools`

## Endpoints

### `POST /linguistic/rewriter/process`

Rewrites text to improve quality, adjust tone, or change structure while preserving the original intent.

**Request body** (`RewriteRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `original_text` | `string` | ✅ | The text to rewrite |
| `target_tone` | `string` | ✅ | Tone like `professional` or `witty` |
| `audience` | `string` | ✅ | The target demographic |
| `transformation_goal` | `string` | ✅ | One of: `paraphrase`, `shorten`, `expand`, `simplify` |
| `custom_instructions` | `string` | ❌ | Specific constraints or rules |

**Example request**:

```bash
curl -X POST http://localhost:8000/linguistic/rewriter/process \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "original_text": "This product is really good and works well.",
    "target_tone": "witty",
    "audience": "software engineers",
    "transformation_goal": "paraphrase",
    "custom_instructions": "keep it under 15 words"
  }'
```

**Response** (`RewriteResponse`):

```json
{
  "rationale": "Tightened phrasing and injected a playful register...",
  "rewritten_text": "This gizmo is honestly quite brilliant.",
  "improvements_made": ["Removed filler words", "Adjusted tone to witty"]
}
```

---

## Error responses

| Status | Detail | Description |
|--------|--------|-------------|
| `401` | `Invalid or missing API key` | Missing/invalid `X-API-Key` header |
| `422` | `validation_error` | Pydantic request validation failed |
| `500` | `Failed to rewrite the text.` | Internal AI processing failure |

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

### `RewriteRecord`

Data contract for tracking a text rewrite (persistence not yet wired up).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique rewrite identifier |
| `target_tone` | `string` | Desired tone of the rewrite |
| `audience` | `string` | The target demographic |
| `transformation_goal` | `string` | The primary objective of the rewrite |
| `original_text` | `string` | The source text |
| `rewritten_text` | `string` | The final polished text |
| `improvements_made` | `array[string]` | Specific changes applied |
| `created_at` | `datetime` | Record creation timestamp |
| `updated_at` | `datetime` | Last-updated timestamp |
| `is_active` | `bool` | Whether the record is active |
