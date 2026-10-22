# Puzzle Generator API

Base path: `/practice/puzzle`
Tag: `Puzzle Generator`

## Overview

A DSPy-driven adaptive puzzle and brain-teaser generator. It adapts the complexity and logic style based on the thematic topic, puzzle format, cognitive domain, and difficulty tier. Generation and evaluation both use ChainOfThought for deep reasoning.

The backend is **stateless**: it keeps no session state. A separate session/memory app owns the user's solved/attempted counts, rolling accuracy, and difficulty progression, and calls the two endpoints per puzzle round.

## Endpoints

### `POST /practice/puzzle/generate`

Generates a personalized cognitive puzzle. A unique internal seed is generated server-side for non-repetitive content.

**Request body** (`PuzzleRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `field_of_interest` | `string` | ✅ | Thematic topic (e.g., `Cyberpunk`, `Ancient Egypt`, `Quantum Physics`) |
| `puzzle_type` | `string` | ✅ | `riddle`, `logic grid`, `sequence`, `wordplay`, `cipher` |
| `target_domain` | `string` | ✅ | `verbal`, `mathematical`, `spatial`, `lateral` |
| `difficulty_level` | `string` | ✅ | `novice`, `intermediate`, `expert`, `genius` |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/puzzle/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "field_of_interest": "Deep Sea Exploration",
    "puzzle_type": "cipher",
    "target_domain": "lateral",
    "difficulty_level": "expert"
  }'
```

**Response** (`PuzzleResponse`):

```json
{
  "puzzler_persona": "A salvaged deep-sea telegraph that only speaks in sonar blips.",
  "puzzle_text": "BLUB BLOO BLOO BLOO BLUB...",
  "solution": "Translate short blips as dots and long as dashes...",
  "cognitive_trigger": "Noticing a Morse pattern hidden inside an unrelated sensory cue",
  "status": "success"
}
```

---

### `POST /practice/puzzle/evaluate`

Evaluates a puzzle attempt, scoring accuracy and providing hints without spoiling the solution.

**Request body** (`PuzzleEvaluationRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `puzzle_context` | `string` | ✅ | The full text of the puzzle |
| `puzzle_type` | `string` | ✅ | `riddle`, `logic grid`, `sequence`, `wordplay`, `cipher` |
| `official_solution` | `string` | ✅ | The factual correct answer and logic |
| `user_response` | `string` | ✅ | The user's input/answer |

**Response** (`PuzzleEvaluationResponse`):

```json
{
  "is_correct": false,
  "accuracy_score": 0.6,
  "evaluation_feedback": "You decoded the first word correctly, but treated every blip as equal length.",
  "hint_redirection": "Count the pauses between groups, not just the blips.",
  "metacognitive_prompt": "What would change if you assumed long and short blips have different meaning?",
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

Both pipelines use sampling temperature `0.7` with ChainOfThought, matching the prototype.

---

## Shared models

### `PuzzleSession`

Persistence contract for a puzzle practice session, managed by the client's session/memory app.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique session identifier |
| `field_of_interest` | `string` | The thematic topic for puzzles |
| `solved` / `attempted` | `int` | Performance counters |
| `accuracy` | `float` | Rolling average accuracy (0.0-1.0) |
| `current_difficulty` | `string` | Current difficulty tier |
| `history` | `array[object]` | Puzzle + result pairs |
| `created_at` / `updated_at` | `datetime` | Timestamps |
| `is_active` | `bool` | Whether the session is active |
