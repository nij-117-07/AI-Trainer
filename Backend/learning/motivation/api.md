# Motivation & Reflection API

Base path: `/learning/motivation`
Tag: `Motivation & Reflection`

## Endpoints

### `POST /learning/motivation/generate`

Generates a personalized motivational quote based on the user's emotional state.

**Request body** (`MotivationRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `seed_topic` | `string` | ✅ | Keyword/topic to anchor the quote (e.g., "Resilience") |
| `quote_type` | `string` | ✅ | One of: `stoic`, `modern`, `poetic`, `tough-love` |
| `user_feeling` | `string` | ✅ | The user's emotional state (e.g., "I feel overwhelmed.") |

**Example request**:

```bash
curl -X POST http://localhost:8000/learning/motivation/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "seed_topic": "Resilience",
    "quote_type": "stoic",
    "user_feeling": "I feel overwhelmed."
  }'
```

**Response** (`MotivationResponse`):

```json
{
  "quote": "The obstacle is the way...",
  "author_persona": "The Stoic Path",
  "actionable_insight": "Write down one thing you control today and do it first.",
  "current_date": "2026-07-31"
}
```

---

### `POST /learning/motivation/reflect`

Generates three deep journaling prompts and a perspective shift based on mood and goals.

**Request body** (`ReflectionRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `current_mood` | `string` | ✅ | The user's current emotional state |
| `goal_alignment` | `string` | ✅ | The goal or value to focus on |
| `recent_patterns` | `string` | ❌ | Summarized mood/progress trends from the past week |

**Example request**:

```bash
curl -X POST http://localhost:8000/learning/motivation/reflect \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "current_mood": "Anxious about work.",
    "goal_alignment": "Creative independence.",
    "recent_patterns": "High energy in mornings, crash by 3 PM."
  }'
```

**Response** (`ReflectionResponse`):

```json
{
  "prompts": [
    "What is one belief about work you have not questioned?",
    "If your anxiety had a voice, what would it be protecting?",
    "What small experiment could move you toward creative independence?"
  ],
  "perspective_shift": "What if anxiety is the cost of caring, not a signal to stop?"
}
```

---

## Error responses

All endpoints return a JSON body on failure.

| Status | Detail | Description |
|--------|--------|-------------|
| `401` | `Invalid or missing API key` | Missing/invalid `X-API-Key` header |
| `422` | `validation_error` | Pydantic request validation failed |
| `500` | `Failed to <action>.` | Internal AI generation failure |

**Example 500:**

```json
{
  "detail": "Failed to generate the motivation quote."
}
```

## Authentication

Optional `X-API-Key` header. When `API_KEY` is set in the environment, the server rejects requests without a matching key. When blank, the guard is disabled.

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `LLM_MODEL_NAME` | `gpt-4o-mini` | Model passed to DSPy |
| `LLM_API_KEY` | *(empty)* | Provider API key |
| `LLM_API_BASE` | `https://api.openai.com/v1` | OpenAI-compatible base URL |
| `LLM_TEMPERATURE` | `0.7` | Sampling temperature |
| `DEBUG` | `false` | FastAPI debug mode |
| `LOG_LEVEL` | `INFO` (`DEBUG` if `DEBUG=true`) | Logging verbosity |
| `HOST` / `PORT` | `0.0.0.0` / `8000` | Uvicorn bind address |

---

## Shared models

### `MotivationRecord`

Data contract for tracking a generated quote (persistence not yet wired up).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique motivation session identifier |
| `seed_topic` | `string` | Keyword/topic that anchored the quote |
| `quote_type` | `string` | Style of the quote |
| `user_feeling` | `string` | The user's emotional state |
| `quote` | `string` | The generated motivational quote |
| `author_persona` | `string` | The persona attributed to the quote |
| `actionable_insight` | `string` | The micro-habit suggested to the user |
| `created_at` | `datetime` | Generation timestamp |
| `is_active` | `bool` | Whether the record is active |

### `ReflectionRecord`

Data contract for tracking a journaling session (persistence not yet wired up).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique reflection session identifier |
| `current_mood` | `string` | The user's emotional state |
| `goal_alignment` | `string` | The goal or value in focus |
| `recent_patterns` | `string` | Summarized mood or progress trends |
| `prompts` | `array[string]` | The generated journaling questions |
| `perspective_shift` | `string` | The reframing thought |
| `created_at` | `datetime` | Generation timestamp |
| `is_active` | `bool` | Whether the record is active |
