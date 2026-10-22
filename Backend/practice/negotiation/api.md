# Negotiation Practice API

Base path: `/practice/negotiation`
Tag: `Negotiation`

## Overview

A DSPy-driven negotiation trainer. The server generates a negotiation scenario, plays the opponent in a practice conversation, analyzes the trainee's messages for negotiation tactics, and evaluates the full session at the end.

The module is **stateless**: it keeps no session state. A separate session/memory app stores the scenario and conversation history and passes them back with every request.

## Flow

1. `POST /scenario` → persist `scenario` + `opening_message`
2. `POST /turn` (or `/opponent-turn` + `/analyze-message`) — any number of times — each carries the stored scenario and growing history
3. `POST /evaluate` — sends the final transcript and outcome for the performance report

---

## Endpoints

### `POST /practice/negotiation/scenario`

Generates a negotiation scenario and the opponent's opening message.

**Request body** (`ScenarioRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `difficulty` | `string` | ❌ | One of: `beginner`, `intermediate`, `advanced` (default: `intermediate`) |
| `domain` | `string` | ✅ | Negotiation domain (e.g., `salary`, `real estate`, `business deal`, `diplomatic`) |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/negotiation/scenario \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "difficulty": "intermediate",
    "domain": "salary"
  }'
```

**Response** (`ScenarioResponse`) — persist the whole `scenario` object and show `opening_message` to the user:

```json
{
  "scenario": {
    "title": "The Counter-Offer",
    "context": "You are a senior engineer offered a position with a modest salary bump...",
    "your_role": "Senior Software Engineer (candidate)",
    "your_goal": "Increase the base salary by at least 15% and get remote days.",
    "your_constraints": "You cannot accept less than a 5% raise; start date is flexible.",
    "opponent_role": "VP of Engineering",
    "opponent_goal": "Stay within the approved budget of a 10% raise.",
    "opponent_constraints": "Cannot exceed 12% salary; may offer stock options instead.",
    "key_issues": ["Base salary", "Remote days", "Signing bonus"],
    "starting_stance_opponent": "Congratulations on the offer! We are excited to have you — let's talk numbers."
  },
  "opening_message": "Congratulations on the offer! We are excited to have you — let's talk numbers.",
  "status": "success"
}
```

---

### `POST /practice/negotiation/turn`

Combined opponent reply + optional message-tactic analysis. Recommended for a typical practice turn.

**Request body** (`NegotiationTurnRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `scenario` | `object` | ✅ | The `scenario` returned by `/scenario` |
| `conversation_history` | `array` | ✅ | List of `{role, message}`; `role` is `user` or `opponent` |
| `user_last_message` | `string` | ✅ | The user's most recent message |
| `analyze_message` | `boolean` | ❌ | Also run tactic analysis in the same call (default: `true`) |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/negotiation/turn \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "scenario": { "title": "The Counter-Offer", "context": "...", "your_role": "...", "your_goal": "...", "your_constraints": "...", "opponent_role": "...", "opponent_goal": "...", "opponent_constraints": "...", "key_issues": ["Base salary"], "starting_stance_opponent": "..." },
    "conversation_history": [
      { "role": "opponent", "message": "Congratulations on the offer! We are excited to have you — let's talk numbers." }
    ],
    "user_last_message": "I'm thrilled about the role, but the base salary is below my expectations. I was hoping for $175k.",
    "analyze_message": true
  }'
```

**Response** (`NegotiationTurnResponse`) — append `{role: user, message: user_last_message}` and `{role: opponent, message: opponent_reply}` to the stored history:

```json
{
  "opponent_reply": "I understand the role is a great fit. The budget for this position was approved at $160k — that's the ceiling I can work with.",
  "internal_position": {
    "satisfaction": 4,
    "willingness_to_concede": "medium",
    "concessions_made": [],
    "key_demands": ["Cap base at $160k", "Keep offer competitive with equity"]
  },
  "analysis": {
    "tactics_used": ["anchoring"],
    "effectiveness_rating": 7,
    "feedback_snippet": "Strong anchor — you set a high reference point early."
  },
  "status": "success"
}
```

`internal_position` is the opponent's private state and should **not** be shown to the user. `analysis` is coach feedback that can be shown immediately.

---

### `POST /practice/negotiation/opponent-turn`

Opponent reply only (no analysis). Use when you already run analysis separately.

**Request body** (`OpponentTurnRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `scenario` | `object` | ✅ | The persisted `scenario` |
| `conversation_history` | `array` | ✅ | List of `{role, message}` |
| `user_last_message` | `string` | ✅ | The user's most recent message |

**Response** (`OpponentTurnResponse`):

```json
{
  "response": "I understand the role is a great fit. The budget for this position was approved at $160k — that's the ceiling I can work with.",
  "internal_position": {
    "satisfaction": 4,
    "willingness_to_concede": "medium",
    "concessions_made": [],
    "key_demands": ["Cap base at $160k", "Keep offer competitive with equity"]
  },
  "status": "success"
}
```

---

### `POST /practice/negotiation/analyze-message`

Analyzes a single trainee message for negotiation tactics, standalone.

**Request body** (`AnalyzeMessageRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | `string` | ✅ | The user's last message to the opponent |
| `scenario_context` | `string` | ✅ | Brief scenario context (any string summary) |

**Response** (`AnalyzeMessageResponse`):

```json
{
  "tactics_used": ["anchoring"],
  "effectiveness_rating": 7,
  "feedback_snippet": "Strong anchor — you set a high reference point early.",
  "status": "success"
}
```

---

### `POST /practice/negotiation/evaluate`

Evaluates the completed session and returns a full performance report.

**Request body** (`EvaluateSessionRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `scenario` | `object` | ✅ | The persisted `scenario` |
| `conversation_history` | `array` | ✅ | Complete transcript (all messages, including opponent openings) |
| `final_outcome` | `string` | ✅ | How it ended (e.g., `agreement`, `impasse`, `walked away`) |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/negotiation/evaluate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "scenario": { "title": "The Counter-Offer", "context": "...", "your_role": "...", "your_goal": "...", "your_constraints": "...", "opponent_role": "...", "opponent_goal": "...", "opponent_constraints": "...", "key_issues": ["Base salary"], "starting_stance_opponent": "..." },
    "conversation_history": [
      { "role": "opponent", "message": "Congratulations on the offer! ..." },
      { "role": "user", "message": "I'm thrilled about the role, but ..." }
    ],
    "final_outcome": "agreement at $165k base plus two remote days"
  }'
```

**Response** (`EvaluateSessionResponse`):

```json
{
  "overall_score": 78,
  "scores_by_category": {
    "preparation": 8,
    "communication": 9,
    "strategy": 7,
    "listening": 7,
    "problem_solving": 6,
    "flexibility": 8
  },
  "strengths": ["Clear anchoring", "Professional tone", "Reasonable concessions"],
  "areas_for_improvement": ["Probe opponent's constraints sooner", "Use objective criteria"],
  "key_takeaways": ["Anchor high but stay credible", "Trade-off concessions", "Ask open questions"],
  "suggested_resources": ["Getting to Yes by Fisher & Ury", "Never Split the Difference by Chris Voss"],
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
  "detail": "Failed to generate the opponent's reply."
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

### `NegotiationSession`

Persistence contract for a negotiation practice session. Managed by the client's session/memory app.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique session identifier |
| `difficulty` | `string` | Difficulty: beginner, intermediate, advanced |
| `domain` | `string` | Negotiation domain |
| `title` | `string` | Scenario title |
| `scenario` | `object` | Full negotiation scenario |
| `conversation_history` | `array` | Transcript of `{role, message}` entries |
| `final_outcome` | `string` | How the negotiation ended |
| `overall_score` | `integer` | Score from 0-100 |
| `created_at` / `updated_at` | `datetime` | Timestamps |
| `is_active` | `bool` | Whether the session is ongoing |

### `NegotiationScenario`

The scenario object returned by `/scenario` and echoed back on every call.

| Field | Type | Description |
|-------|------|-------------|
| `title` | `string` | Catchy scenario title |
| `context` | `string` | Background situation (2-3 sentences) |
| `your_role` | `string` | Practice user's role/title |
| `your_goal` | `string` | What the user wants to achieve |
| `your_constraints` | `string` | Limits the user faces |
| `opponent_role` | `string` | AI opponent's role/title |
| `opponent_goal` | `string` | What the opponent wants |
| `opponent_constraints` | `string` | Limits the opponent faces |
| `key_issues` | `array` | 2-4 negotiable items/topics |
| `starting_stance_opponent` | `string` | Opponent's opening message |
