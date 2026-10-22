# Idioms API

Base path: `/linguistic/idioms`
Tag: `Idioms`

## Endpoints

### `POST /linguistic/idioms/generate`

Generates an idiomatic expression lesson based on linguistic parameters.

**Request body** (`IdiomRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `target_language` | `string` | ✅ | The language the user wants to learn (e.g., "French") |
| `user_proficiency` | `string` | ✅ | One of: `beginner`, `intermediate`, `advanced`, `native-aspirant` |
| `theme_or_keyword` | `string` | ✅ | The general topic (e.g., "Success and Hard Work") |
| `native_language` | `string` | ✅ | The user's primary language for explanations |
| `seed` | `string` | ✅ | Unique string for rotation logic |
| `custom_user_request` | `string` | ❌ | Specific preferences (e.g., "make it funny") |

**Example request**:

```bash
curl -X POST http://localhost:8000/linguistic/idioms/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "target_language": "French",
    "user_proficiency": "intermediate",
    "theme_or_keyword": "Success and Hard Work",
    "native_language": "English",
    "seed": "rotation_2026_07",
    "custom_user_request": "make it funny"
  }'
```

**Response** (`IdiomResponse`):

```json
{
  "rationale": "Selected 'mettre la main à la pâte' for a hands-on work theme...",
  "idiom_in_target_language": "mettre la main à la pâte",
  "phonetic_pronunciation": "meh-treh la man ah la paht",
  "figurative_meaning": "To pitch in and get your hands dirty with the work",
  "cultural_context": "Common in everyday workplace French...",
  "equivalent_in_native_language": "to get stuck in",
  "dialogue_scenario": "A: 'Tu peux m'aider avec le rapport?' B: 'Bien sûr, je mets la main à la pâte.'",
  "practice_prompt": "Write a sentence using this idiom about teamwork."
}
```

---

## Error responses

| Status | Detail | Description |
|--------|--------|-------------|
| `401` | `Invalid or missing API key` | Missing/invalid `X-API-Key` header |
| `422` | `validation_error` | Pydantic request validation failed |
| `500` | `Failed to generate the idiom lesson.` | Internal AI processing failure |

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

### `IdiomLessonRecord`

Data contract for tracking an idiom lesson (persistence not yet wired up).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique lesson identifier |
| `target_language` | `string` | The language the user wants to learn |
| `native_language` | `string` | The user's primary language |
| `theme_or_keyword` | `string` | The general topic of the idiom |
| `idiom_in_target_language` | `string` | The idiom in the target language |
| `figurative_meaning` | `string` | The meaning in the native language |
| `seed` | `string` | Rotation seed used for the generation |
| `created_at` | `datetime` | Lesson creation timestamp |
| `updated_at` | `datetime` | Last-updated timestamp |
| `is_active` | `bool` | Whether the lesson is active |
