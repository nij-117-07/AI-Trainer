# Joke Coach API

Base path: `/practice/joke_coach`
Tag: `Joke Coach`

## Overview

A DSPy-driven joke practice system. It generates original jokes, evaluates them with structured feedback, rewrites them to be funnier/sharper, classifies them for organization, coaches the user through practice sessions, and simulates crowd response before a performance.

The backend is **stateless**: it keeps no session state. A separate session/memory app owns the practice flow (which jokes were generated, their evaluations, the user's skill level and focus) and calls the individual endpoints as the user works through a session.

## Endpoints

### `POST /practice/joke_coach/generate`

Generates an original joke.

**Request body** (`GenerateJokeRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topic` | `string` | ✅ | Subject or theme (e.g., `programming`, `cats`, `coffee`) |
| `joke_style` | `string` | ❌ | `pun`, `one-liner`, `story`, `observational`, `dad-joke` (default `dad-joke`) |
| `audience` | `string` | ❌ | Target audience (default `general`) |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/joke_coach/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "topic": "programming",
    "joke_style": "dad-joke",
    "audience": "tech workers"
  }'
```

**Response** (`GenerateJokeResponse`):

```json
{
  "joke": "Why do programmers prefer dark mode? Because light attracts bugs.",
  "setup": "Why do programmers prefer dark mode?",
  "punchline": "Because light attracts bugs.",
  "humor_type": "wordplay",
  "difficulty_rating": 2,
  "status": "success"
}
```

---

### `POST /practice/joke_coach/evaluate`

Evaluates a joke with structured feedback and scores.

**Request body** (`EvaluateJokeRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `joke` | `string` | ✅ | The complete joke text |
| `intended_audience` | `string` | ❌ | Who the joke is for (default `general`) |
| `context` | `string` | ❌ | e.g., `open mic night`, `family dinner`, `comedy club` |

**Response** (`EvaluateJokeResponse`):

```json
{
  "overall_score": 7.2,
  "humor_score": 7.8,
  "originality_score": 6.4,
  "delivery_score": 8.1,
  "appropriateness": "all-ages",
  "strengths": ["Crisp setup", "Universal punchline"],
  "weaknesses": ["Punchline telegraphs early"],
  "feedback": "Strong wordplay, but tighten the pause before the tag...",
  "is_recommended": true,
  "status": "success"
}
```

---

### `POST /practice/joke_coach/rewrite`

Rewrites a joke to improve a specific aspect.

**Request body** (`RewriteJokeRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `original_joke` | `string` | ✅ | The joke to improve |
| `improvement_goal` | `string` | ✅ | `funnier`, `cleaner`, `shorter`, `more-clever`, `better-timing` |
| `target_audience` | `string` | ✅ | Who should find it funny |

**Response** (`RewriteJokeResponse`):

```json
{
  "rewritten_joke": "Dark mode: the only place light attracts bugs.",
  "setup": "Dark mode is like a safe house...",
  "punchline": "...because light attracts bugs.",
  "changes_made": ["Shortened setup", "Moved punchline earlier"],
  "performance_notes": "Pause half a beat before 'bugs'.",
  "status": "success"
}
```

---

### `POST /practice/joke_coach/classify`

Classifies a joke by style, mechanism, structure, and difficulty.

**Request body** (`ClassifyJokeRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `joke` | `string` | ✅ | The joke text |

**Response** (`ClassifyJokeResponse`):

```json
{
  "style": "dad-joke",
  "humor_mechanism": "wordplay",
  "structure": "setup -> turn -> punchline",
  "tags": ["programming", "tech", "food"],
  "practice_category": "beginner",
  "similar_joke_styles": ["one-liner", "observational"],
  "status": "success"
}
```

---

### `POST /practice/joke_coach/practice`

Generates a structured joke practice session.

**Request body** (`PracticeCoachRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `current_skill_level` | `string` | ✅ | `beginner`, `intermediate`, or `advanced` |
| `practice_focus` | `string` | ✅ | `writing`, `delivery`, `timing`, `crowd-work`, `stage-presence`, or `all` |
| `user_joke` | `string` | ❌ | The user's joke to practice with |
| `session_goal` | `string` | ✅ | What the user wants to achieve |

**Response** (`PracticeCoachResponse`):

```json
{
  "exercise_type": "Timing drill",
  "exercise_instructions": "Deliver the joke five times, holding the beat longer each pass...",
  "practice_joke": null,
  "drill_prompt": "Record yourself; compare beat lengths on takes 1 and 5.",
  "success_criteria": ["Consistent 1.5s pause before the tag"],
  "next_steps": ["Try it on a friend", "Rewrite for a new audience"],
  "status": "success"
}
```

---

### `POST /practice/joke_coach/simulate-crowd`

Simulates how an audience might react to a joke.

**Request body** (`CrowdSimulationRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `joke` | `string` | ✅ | The joke text |
| `venue_type` | `string` | ✅ | `comedy-club`, `open-mic`, `corporate-event`, `family-gathering`, `college-show` |
| `audience_demographic` | `string` | ✅ | Description of the expected audience |

**Response** (`CrowdSimulationResponse`):

```json
{
  "predicted_response": "solid-laugh",
  "laugh_probability": 0.72,
  "best_delivery_style": "Deadpan, slow burn",
  "potential_risks": ["Tech-heavy jargon may lose non-tech rows"],
  "alternative_punchline": "Because it's the only place bugs fear the light.",
  "crowd_work_opportunity": "Ask the room who has fought a bug today before the tag.",
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
  "detail": "Failed to generate the joke."
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
| `LLM_TEMPERATURE` | `0.7` | Default sampling temperature |
| `DEBUG` | `false` | FastAPI debug mode |
| `LOG_LEVEL` | `INFO` (`DEBUG` if `DEBUG=true`) | Logging verbosity |
| `HOST` / `PORT` | `0.0.0.0` / `8000` | Uvicorn bind address |

Each pipeline uses its own sampling temperature to match its job: generate `0.8`, rewrite `0.6`, practice `0.5`, crowd `0.4`, evaluate `0.3`, classify `0.2`.

---

## Shared models

### `JokePracticeSession`

Persistence contract for a joke practice session, managed by the client's session/memory app.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique session identifier |
| `skill_level` | `string` | User's comedy skill level |
| `practice_focus` | `string` | Current practice focus |
| `goal` | `string` | What the user wants to achieve |
| `jokes` | `array[object]` | Jokes and their metadata |
| `evaluations` | `array[object]` | Feedback history |
| `created_at` / `updated_at` | `datetime` | Timestamps |
| `is_active` | `bool` | Whether the session is active |
