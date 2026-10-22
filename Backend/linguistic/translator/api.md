# Translator API

Base path: `/linguistic/translator`
Tag: `Linguistic Services`

## Endpoints

### `POST /linguistic/translator/process`

Processes a contextual translation using DSPy Chain of Thought.

**Request body** (`TranslationRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text_to_translate` | `string` | ✅ | The source text that needs translation |
| `source_language` | `string` | ✅ | The language of the input text |
| `target_language` | `string` | ✅ | The language the text should be translated into |
| `tone` | `string` | ✅ | One of: `formal`, `casual`, `business`, `poetic`, `technical` |
| `reference_material` | `string` | ❌ | Glossary or context snippets to maintain consistency |
| `custom_instructions` | `string` | ❌ | Specific rules (e.g., "avoid gendered pronouns") |

**Example request**:

```bash
curl -X POST http://localhost:8000/linguistic/translator/process \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "text_to_translate": "The early bird catches the worm.",
    "source_language": "English",
    "target_language": "Japanese",
    "tone": "formal",
    "reference_material": null,
    "custom_instructions": "keep it idiomatic"
  }'
```

**Response** (`TranslationResponse`):

```json
{
  "rationale": "Used the equivalent Japanese proverb 早起きは三文の徳...",
  "translated_text": "早起きは三文の徳。",
  "cultural_notes": "A matching native idiom was preferred over a literal rendering."
}
```

---

## Error responses

| Status | Detail | Description |
|--------|--------|-------------|
| `401` | `Invalid or missing API key` | Missing/invalid `X-API-Key` header |
| `422` | `validation_error` | Pydantic request validation failed |
| `500` | `Failed to process the translation.` | Internal AI processing failure |

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

### `TranslationRecord`

Data contract for tracking a translation request (persistence not yet wired up).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique translation identifier |
| `source_language` | `string` | The language of the input text |
| `target_language` | `string` | The language of the output text |
| `tone` | `string` | The desired style of the translation |
| `text_to_translate` | `string` | The source text |
| `translated_text` | `string` | The final translated content |
| `created_at` | `datetime` | Record creation timestamp |
| `updated_at` | `datetime` | Last-updated timestamp |
| `is_active` | `bool` | Whether the record is active |
