# Clarity Trainer API

Base path: `/practice/clarity_trainer`
Tag: `Clarity Trainer`

## Overview

A DSPy-driven "Speak Less, Say More" communication trainer. The server generates a workplace/life scenario that challenges the user to speak concisely, then evaluates their response in four ways:

1. **Analysis** — verbosity, word count, filler words, clarity, goal achievement, tone fit
2. **Coach feedback** — a direct, actionable critique with a quality score
3. **Better version** — a concise rewrite of the user's response
4. **Gold standard** — the ideal response a master communicator would give

The module is **stateless**: it keeps no session state. A separate session/memory app stores the generated scenario and passes it back with the evaluation request.

## Flow

1. `POST /scenario` → persist `scenario`
2. User responds to `scenario.prompt_to_user`
3. `POST /evaluate` → sends the persisted `scenario` + `user_response`, gets the full report

---

## Endpoints

### `POST /practice/clarity_trainer/scenario`

Generates a communication practice scenario.

**Request body** (`ScenarioRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `difficulty` | `string` | ❌ | One of: `easy`, `medium`, `hard`, `advanced` (random if omitted) |
| `category` | `string` | ❌ | One of: `team update`, `giving feedback`, `difficult conversation`, `pitch or ask`, `status report`, `conflict resolution`, `presentation opening`, `email`, `negotiation`, `apology` (random if omitted) |
| `user_context` | `string` | ❌ | User's role/industry (e.g., `software engineer`, `manager`) |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/clarity_trainer/scenario \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "difficulty": "medium",
    "category": "difficult conversation",
    "user_context": "software engineer"
  }'
```

**Response** (`ScenarioResponse`) — persist the whole `scenario` object:

```json
{
  "scenario": {
    "title": "The Scope Squeeze",
    "situation": "Your PM just added a last-minute feature to this sprint without asking. You need to push back without sounding difficult.",
    "characters": ["You (software engineer)", "Priya (product manager)"],
    "goal": "Decline the scope addition and propose a timeline that protects the sprint.",
    "constraints": ["Keep it under 30 seconds", "Priya is defensive"],
    "prompt_to_user": "What do you say to open this conversation?",
    "ideal_length_seconds": 30,
    "difficulty": "medium"
  },
  "status": "success"
}
```

---

### `POST /practice/clarity_trainer/evaluate`

Evaluates a user's response to a scenario and returns the full training report.

**Request body** (`EvaluateRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `scenario` | `object` | ✅ | The `scenario` returned by `/scenario` |
| `user_response` | `string` | ✅ | The user's actual response |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/clarity_trainer/evaluate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "scenario": { "title": "The Scope Squeeze", "situation": "...", "characters": ["..."], "goal": "...", "constraints": ["..."], "prompt_to_user": "...", "ideal_length_seconds": 30, "difficulty": "medium" },
    "user_response": "Hey Priya, I know you want this feature in, but honestly we just can't squeeze it into this sprint. There's just no way, the team is already at capacity and everyone is super busy with the stuff we already committed to, so I think we should probably move it to next sprint or something."
  }'
```

**Response** (`EvaluateResponse`):

```json
{
  "scenario": { "title": "The Scope Squeeze", "...": "..." },
  "user_response": "Hey Priya, I know you want this feature in, ...",
  "analysis": {
    "verbosity": "verbose",
    "word_count": 47,
    "filler_words": ["honestly", "just", "super", "probably"],
    "redundant_phrases": ["we just can't squeeze it", "there's just no way"],
    "clarity": "good",
    "goal_achievement": 0.7,
    "tone_fit": 0.8,
    "core_message": "The feature cannot fit this sprint; propose moving it to the next one.",
    "scenario_fit_note": "Message is on point but padded with hedging language."
  },
  "feedback": {
    "score": 7,
    "what_worked": ["Clear position", "Offered an alternative"],
    "what_to_cut": ["'honestly'", "'I think we should probably'"],
    "what_to_add": ["A concrete alternative timing"],
    "rewrite_suggestion": "Cut every hedge and state the next available slot.",
    "one_principle": "State the decision, then the reason, then the alternative.",
    "coach_message": "Strong core message. Tighten it by removing hedges and you'll land the same point in half the words."
  },
  "better_version": {
    "rewritten": "Priya, this feature can't fit this sprint — the team is at capacity. Next sprint has room; let's slot it there.",
    "original_words": 47,
    "new_words": 24,
    "percent_reduced": 49,
    "why_better": ["Removes all hedges", "States the alternative concretely", "Respectful but direct"]
  },
  "gold_standard": {
    "opening": "Priya, I need to push back on the sprint scope.",
    "full_response": "Priya, I need to push back on the sprint scope. Adding this now puts our current commitments at risk. I've got capacity to start it next sprint — let's plan it then.",
    "why_ideal": ["Opens with a clear position", "Gives the reason immediately", "Proposes a specific alternative"],
    "word_count": 37,
    "seconds": 15
  },
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

**Example 500:**

```json
{
  "detail": "Failed to evaluate the user's response."
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

### `ClarityTrainingSession`

Persistence contract for a clarity training session. Managed by the client's session/memory app.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique session identifier |
| `difficulty` | `string` | Difficulty: easy, medium, hard, advanced |
| `category` | `string` | Scenario category |
| `title` | `string` | Scenario title |
| `scenario` | `object` | Full communication scenario |
| `user_response` | `string` | The user's original response |
| `quality_score` | `integer` | Coach quality score out of 10 |
| `word_count` | `integer` | Word count of the user's response |
| `clarity` | `string` | Clarity rating: excellent, good, fair, poor |
| `created_at` / `updated_at` | `datetime` | Timestamps |
| `is_active` | `bool` | Whether the session is ongoing |

### `CommunicationScenario`

The scenario object returned by `/scenario` and echoed back on evaluation.

| Field | Type | Description |
|-------|------|-------------|
| `title` | `string` | Short, punchy scenario title |
| `situation` | `string` | Vivid description of the situation (2-4 sentences) |
| `characters` | `array` | People involved and their roles |
| `goal` | `string` | What the user needs to achieve |
| `constraints` | `array` | Specific challenges or rules |
| `prompt_to_user` | `string` | The question posed to the user |
| `ideal_length_seconds` | `integer` | Estimated ideal response time in seconds |
| `difficulty` | `string` | Actual difficulty of this scenario |
