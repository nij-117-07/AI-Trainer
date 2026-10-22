# Word of the Day API

Base path: `/linguistic/word_of_the_day`
Tag: `Word of the Day`

## Endpoints

### `POST /linguistic/word_of_the_day/`

Fetches a linguistically rich "Word of the Day" based on the provided configuration.

**Request body** (`WOTDRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `target_language` | `string` | ✅ | The language of the Word of the Day (e.g., "Japanese") |
| `native_language` | `string` | ❌ | User's primary language for explanations (default: `English`) |
| `proficiency` | `string` | ❌ | One of: `basic`, `academic`, `poetic`, `slang` (default: `academic`) |
| `theme` | `string` | ❌ | Theme like `Nature` or `Technology` (default: `General`) |
| `custom_instructions` | `string` | ❌ | Extra rules such as `Untranslatable words only` |

**Example request**:

```bash
curl -X POST http://localhost:8000/linguistic/word_of_the_day/ \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "target_language": "Japanese",
    "native_language": "English",
    "proficiency": "academic",
    "theme": "Nature",
    "custom_instructions": "Untranslatable words only"
  }'
```

**Response** (`WOTDResponse`):

```json
{
  "word": "kogarashi",
  "native_translation": "a cold wind announcing winter",
  "phonetic_and_audio_guide": "ko-ga-ra-shi (IPA: /kogaɾaɕi/)",
  "morphology_breakdown": "木 (tree) + 枯らし (withering) — 'the withering wind'",
  "primary_definition": "A cold, dry winter wind that signals the arrival of winter.",
  "the_vibe_check": "Poignant, nostalgic; evokes the quiet passing of seasons.",
  "historical_evolution": "In the Heian period it meant only a cold wind; by the Edo period it carried seasonal poetry imagery.",
  "modern_usage_sentence": "小枯らしが吹くと、冬の匂いがする。 (When kogarashi blows, you can smell winter.)",
  "synonym_web": ["winter wind", "chilly gust", "seasons turning"]
}
```

---

## Error responses

All endpoints return a JSON body on failure.

| Status | Detail | Description |
|--------|--------|-------------|
| `401` | `Invalid or missing API key` | Missing/invalid `X-API-Key` header |
| `422` | `validation_error` | Pydantic request validation failed |
| `500` | `Failed to generate the Word of the Day.` | Internal AI processing failure |

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

### `WordOfTheDayEntry`

Data contract for tracking a generated Word of the Day (persistence not yet wired up).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique entry identifier |
| `target_language` | `string` | The language of the chosen word |
| `native_language` | `string` | User's primary language |
| `word` | `string` | The chosen word |
| `native_translation` | `string` | Closest native-language equivalent |
| `date` | `date` | Day the word was generated |
| `created_at` | `datetime` | Entry creation timestamp |
| `updated_at` | `datetime` | Last-updated timestamp |
| `is_active` | `bool` | Whether the entry is active |
