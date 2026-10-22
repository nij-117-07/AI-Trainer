# Sentence of the Day API

Base path: `/linguistic/sentence_of_the_day`
Tag: `Linguistic Insights`

## Endpoints

### `POST /linguistic/sentence_of_the_day/`

Fetches the daily featured sentence with linguistic and cultural nuances.

**Request body** (`SentenceRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `target_language` | `string` | ✅ | The language the user is learning (e.g., "Spanish") |
| `native_language` | `string` | ✅ | The user's primary language (e.g., "English") |
| `context_setting` | `string` | ✅ | One of: `business`, `casual`, `literary`, `romantic`, `travel` |
| `complexity_level` | `string` | ✅ | One of: `beginner`, `intermediate`, `advanced`, `native-level` |

**Example request**:

```bash
curl -X POST http://localhost:8000/linguistic/sentence_of_the_day/ \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "target_language": "Spanish",
    "native_language": "English",
    "context_setting": "literary",
    "complexity_level": "advanced"
  }'
```

**Response** (`SentenceResponse`):

```json
{
  "date": "2026-07-31",
  "target_sentence": "El hábito no hace al monje.",
  "literal_translation": "The habit does not make the monk.",
  "natural_translation": "Don't judge a book by its cover.",
  "grammatical_highlight": "Uses the emphatic 'no ... al' negation pattern...",
  "cultural_context": "A proverb used when appearances deceive...",
  "substitution_options": ["El traje no hace al caballero."]
}
```

---

## Error responses

| Status | Detail | Description |
|--------|--------|-------------|
| `401` | `Invalid or missing API key` | Missing/invalid `X-API-Key` header |
| `422` | `validation_error` | Pydantic request validation failed |
| `500` | `Failed to generate the linguistic insight.` | Internal AI processing failure |

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

### `SentenceOfTheDayEntry`

Data contract for tracking a generated Sentence of the Day (persistence not yet wired up).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique entry identifier |
| `target_language` | `string` | The language being learned |
| `native_language` | `string` | The user's primary language |
| `target_sentence` | `string` | The sentence in the target language |
| `natural_translation` | `string` | Meaning-based native-language translation |
| `date` | `date` | Day the sentence was generated |
| `substitution_options` | `array[string]` | Variations of the sentence |
| `created_at` | `datetime` | Entry creation timestamp |
| `updated_at` | `datetime` | Last-updated timestamp |
| `is_active` | `bool` | Whether the entry is active |
