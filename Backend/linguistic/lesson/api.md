# Lesson API

Base path: `/linguistic/lesson`
Tag: `Lessons`

## Endpoints

### `POST /linguistic/lesson/generate`

Generates a scaffolded AI language lesson based on user profile and theme.

**Request body** (`LessonRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `native_language` | `string` | ✅ | The user's primary language |
| `target_language` | `string` | ✅ | The language the user is learning |
| `current_level` | `string` | ✅ | CEFR level: `A1`, `A2`, `B1`, `B2`, `C1`, `C2` |
| `last_lesson_summary` | `string` | ❌ | Brief recap of previous concepts |
| `learning_focus` | `string` | ✅ | One of: `Grammar`, `Vocabulary`, `Conversation`, `Culture`, `Pronunciation` |
| `complexity_weight` | `string` | ✅ | One of: `Low`, `Medium`, `High` |
| `seed` | `string` | ✅ | Random string to ensure variety |
| `user_custom_instruction` | `string` | ❌ | Thematic constraints (e.g., "Cyberpunk setting") |

**Example request**:

```bash
curl -X POST http://localhost:8000/linguistic/lesson/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "native_language": "English",
    "target_language": "Japanese",
    "current_level": "A2",
    "last_lesson_summary": "Covered basic greetings",
    "learning_focus": "Vocabulary",
    "complexity_weight": "Medium",
    "seed": "lesson_2026_07",
    "user_custom_instruction": "Cyberpunk setting"
  }'
```

**Response** (`LessonResponse`):

```json
{
  "header": "Neo-Tokyo Street Phrases",
  "comparative_analysis": "Japanese counters differ from English plurals...",
  "deep_dive": "In cyberpunk Tokyo, street slang blends English loanwords...",
  "vocabulary": [
    { "word": "ネオン", "ipa": "/ne.oɴ/", "translation": "neon", "example": "ネオンが光っている。" }
  ],
  "practice": ["Match each word to its meaning", "Convert the sentence from formal to street register"],
  "nuance": "In Osaka, people say おおきに instead of ありがとう...",
  "homework": "Find three neon signs in your city and describe them in Japanese."
}
```

---

## Error responses

| Status | Detail | Description |
|--------|--------|-------------|
| `401` | `Invalid or missing API key` | Missing/invalid `X-API-Key` header |
| `422` | `validation_error` | Pydantic request validation failed |
| `500` | `Failed to generate the pedagogical content.` | Internal AI processing failure |

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

### `LessonRecord`

Data contract for tracking a generated lesson (persistence not yet wired up).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique lesson identifier |
| `native_language` | `string` | The user's primary language |
| `target_language` | `string` | The language being learned |
| `current_level` | `string` | CEFR proficiency level |
| `learning_focus` | `string` | The pedagogical focus of the lesson |
| `lesson_header` | `string` | The creative lesson title |
| `vocabulary` | `array[object]` | The thematic vocabulary list |
| `seed` | `string` | Variety seed used for generation |
| `created_at` | `datetime` | Lesson creation timestamp |
| `updated_at` | `datetime` | Last-updated timestamp |
| `is_active` | `bool` | Whether the lesson is active |
