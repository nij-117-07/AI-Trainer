# Riddle Generator API

Base path: `/practice/riddle`
Tag: `Riddle Generator`

## Overview

A DSPy-driven adaptive riddle generator targeting fluid reasoning. It produces riddles tailored to the user's topic of interest, cognitive domain, and difficulty tier, then evaluates the user's answer without ever revealing the solution on a wrong attempt.

The backend is **stateless**: it keeps no session state. A separate session/memory app owns the user's streak, solved/attempted counts, and difficulty progression, and calls the two endpoints per riddle round.

## Endpoints

### `POST /practice/riddle/generate`

Generates an adaptive riddle. A unique internal seed is generated server-side to ensure non-repetitive content.

**Request body** (`RiddleRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `field_of_interest` | `string` | ✅ | The topic (e.g., `Space`, `Ancient Architecture`) |
| `target_domain` | `string` | ✅ | `verbal`, `mathematical`, `spatial`, `lateral` |
| `difficulty_level` | `string` | ✅ | `novice`, `intermediate`, `expert`, `genius` |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/riddle/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "field_of_interest": "Ancient Architecture",
    "target_domain": "lateral",
    "difficulty_level": "intermediate"
  }'
```

**Response** (`RiddleResponse`):

```json
{
  "riddle_text": "I have keystones but no keys...",
  "solution": "A Roman arch: the keystone locks the structure in place.",
  "cognitive_trigger": "Reframing a familiar object through its structural role",
  "status": "success"
}
```

---

### `POST /practice/riddle/evaluate`

Evaluates a user's answer against the riddle solution.

**Request body** (`EvaluationRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `riddle_text` | `string` | ✅ | The original riddle |
| `solution` | `string` | ✅ | The correct answer |
| `user_answer` | `string` | ✅ | The user's attempt or request for help |

**Response** (`EvaluationResponse`):

```json
{
  "is_correct": false,
  "feedback": "Close, but focus on what holds the structure together rather than its decoration.",
  "thought_redirection": "Think about the single stone that cannot be removed without collapse.",
  "status": "success"
}
```

---

## Error responses

All endpoints return a JSON body on failure.

| Status | Detail | Description |
|--------|--------|-------------|
| `401` | `Invalid or missing API key` | Missing/invalid `X-API-Key` header |
| `422` | `validation_error` | Pydantic request validation failed |
| `500` | `Failed to <action>.` | Internal AI processing failure |

## Authentication

Optional `X-API-Key` header. When `API_KEY` is set in the environment, the server rejects requests without a matching key. When blank, the guard is disabled.

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `LLM_MODEL_NAME` | `gpt-4o-mini` | Model passed to DSPy |
| `LLM_API_KEY` | *(empty)* | Provider API key |
| `LLM_API_BASE` | `https://api.openai.com/v1` | OpenAI-compatible base URL |
| `LLM_TEMPERATURE` | `0.7` | Default sampling temperature |
| `DEBUG` | `false` | FastAPI debug mode |
| `LOG_LEVEL` | `INFO` (`DEBUG` if `DEBUG=true`) | Logging verbosity |
| `HOST` / `PORT` | `0.0.0.0` / `8000` | Uvicorn bind address |

Pipelines use sampling temperature `0.7` for generation (creative variety) and `0.2` for evaluation (logical consistency).

---

## Shared models

### `RiddleSession`

Persistence contract for a riddle practice session, managed by the client's session/memory app.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique session identifier |
| `field_of_interest` | `string` | The topic for riddles |
| `solved` / `attempted` | `int` | Performance counters |
| `current_difficulty` | `string` | Current difficulty tier |
| `history` | `array[object]` | Riddle + result pairs |
| `created_at` / `updated_at` | `datetime` | Timestamps |
| `is_active` | `bool` | Whether the session is active |
