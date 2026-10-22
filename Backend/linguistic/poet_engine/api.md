# Poet Engine API

Base path: `/linguistic/poet_engine`
Tag: `Poetic Philology`

## Endpoints

### `POST /linguistic/poet_engine/explain`

Explains the "Soul" of a word using AI-driven poetic philology.

**Request body** (`ConceptRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `target_language` | `string` | ✅ | The source language of the concept (e.g., "Urdu") |
| `native_language` | `string` | ✅ | The user's primary language for the explanation |
| `concept_word` | `string` | ✅ | The specific word or abstract concept (e.g., "Ishq") |
| `poetic_style` | `string` | ✅ | One of: `Shayari/Couplet`, `Haiku`, `Metaphorical Prose`, `Ghazal-style` |
| `user_mood` | `string` | ❌ | Emotional tone (default: `mystical`) |
| `user_custom_instruction` | `string` | ❌ | Specific constraints (e.g., nature metaphors, urban settings) |

**Example request**:

```bash
curl -X POST http://localhost:8000/linguistic/poet_engine/explain \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "target_language": "Urdu",
    "native_language": "English",
    "concept_word": "Ishq",
    "poetic_style": "Shayari/Couplet",
    "user_mood": "mystical",
    "user_custom_instruction": null
  }'
```

**Response** (`ConceptResponse`):

```json
{
  "etymological_soul": "Derived from Arabic 'ishq' (عشق), rooted in the concept of passionate, consuming love...",
  "original_poetry": "عشق سے پہلے تھی تنہائی کا سفر...",
  "soulful_translation": "Before love, my journey was one of solitude...",
  "philosophical_reflection": "Ishq is not merely love but the dissolution of the self into the beloved...",
  "visual_metaphor": "A moth circling a candle's flame, compelled despite the burn..."
}
```

---

## Error responses

| Status | Detail | Description |
|--------|--------|-------------|
| `401` | `Invalid or missing API key` | Missing/invalid `X-API-Key` header |
| `422` | `validation_error` | Pydantic request validation failed |
| `500` | `Failed to explain the concept.` | Internal AI processing failure |

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

### `PoetExplanationRecord`

Data contract for tracking a poetic philology explanation (persistence not yet wired up).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique explanation identifier |
| `target_language` | `string` | The source language of the concept |
| `native_language` | `string` | The user's primary language |
| `concept_word` | `string` | The specific word or abstract concept |
| `poetic_style` | `string` | The poetic form used |
| `original_poetry` | `string` | The poetic piece in the target language |
| `soulful_translation` | `string` | The deep native-language translation |
| `created_at` | `datetime` | Record creation timestamp |
| `updated_at` | `datetime` | Last-updated timestamp |
| `is_active` | `bool` | Whether the record is active |
