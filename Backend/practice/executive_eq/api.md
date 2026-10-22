# Executive EQ Trainer API

Base path: `/practice/executive_eq`
Tag: `Executive EQ Trainer`

## Overview

A DSPy-driven executive EQ training simulator. It places the user in high-stakes corporate scenarios where they must communicate through subtext ("say it without saying it"). The module generates the simulation's foundation (setting, stakes, NPC), produces the NPC's next move with EQ coaching each turn, and grades the user's response for subtext accuracy, status management, and strategic alignment.

The backend is **stateless**: it keeps no session state. A separate session/memory app owns the scenario, the dialogue history, and the running grades, and passes them back into each call.

## Endpoints

### `POST /practice/executive_eq/scenario`

Builds the simulation's foundation: scenario title, setting, NPC profile, stakes, and the opening hook.

**Request body** (`ScenarioRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_role` | `string` | ✅ | The role the user is playing (e.g., `VP of Sales`, `CEO`) |
| `narrative_arc` | `string` | ✅ | The strategic goal (e.g., `Deflecting a hostile takeover`) |
| `learning_focus` | `string` | ✅ | `diplomatic_refusal`, `assertive_silence`, `implied_authority`, `strategic_ambiguity` |
| `difficulty_level` | `string` | ✅ | `Rising Star`, `Seasoned Exec`, `Ruthless Board`, `Crisis Mode` |
| `industry_context` | `string` | ❌ | e.g., `Biotech`, `FinTech` |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/executive_eq/scenario \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "user_role": "Chief Technology Officer",
    "narrative_arc": "Delay a product launch without admitting the code is buggy",
    "learning_focus": "strategic_ambiguity",
    "difficulty_level": "Ruthless Board",
    "industry_context": "FinTech"
  }'
```

**Response** (`ScenarioResponse`):

```json
{
  "scenario_title": "Operation: Silent Launch",
  "setting_description": "A glass-walled boardroom overlooking the harbor...",
  "npc_profile": {
    "name": "Elena Marsh",
    "title": "Chief Financial Officer",
    "personality": "Relentless, data-driven, publicly supportive",
    "hidden_motive": "Wants a launch date to stabilize Q3 guidance",
    "tell": "Taps her pen when she disbelieves you"
  },
  "initial_stakes": "A public delay is read as fraud; an on-time launch ships broken code.",
  "opening_hook": "Elena slides the release calendar across the table: 'So. When do we ship?'",
  "status": "success"
}
```

---

### `POST /practice/executive_eq/turn`

Generates the NPC's next move, the meeting's atmosphere, and EQ coaching for this turn. The webapp should pass the NPC's `hidden_motive` from the scenario as the `seed` to keep the NPC psychologically consistent.

**Request body** (`TurnRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `previous_scenario` | `string` | ❌ | Context of the last lesson/meeting (e.g., the scenario title) |
| `narrative_arc` | `string` | ✅ | The overall goal |
| `chat_history` | `array[object]` | ❌ | `[{ "role": "user"/"npc", "content": "..." }]` |
| `learning_focus` | `string` | ✅ | The EQ skill being practiced this turn |
| `seed` | `string` | ✅ | Usually the NPC's `hidden_motive` (varies political tension) |
| `user_customization` | `string` | ❌ | e.g., `Make my boss extremely aggressive` |

**Response** (`TurnResponse`):

```json
{
  "rationale": "Elena is anchoring on a date to force you to choose between two losses...",
  "meeting_scenario": "The air is calm but the silence is loaded...",
  "npc_dialogue": "I understand engineering wants more time. Give me the number you can defend.",
  "eq_coach_message": "Don't refuse a date; refuse the frame. Signal competence, not evasion.",
  "suggested_strategies": [
    "The Direct approach: name the real blocker without naming the bug.",
    "The Subtle Pivot: reframe the question around readiness gates.",
    "The Power Move: give a date that is conditional on your criteria."
  ],
  "status": "success"
}
```

---

### `POST /practice/executive_eq/evaluate`

Grades the user's response. Uses ChainOfThought for deep analytical reasoning.

**Request body** (`EvaluateRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `scenario_context` | `string` | ✅ | The immediate situation the user responded to |
| `npc_last_statement` | `string` | ✅ | What the NPC just said/did |
| `user_response` | `string` | ✅ | The user's actual words/actions |
| `learning_focus` | `string` | ✅ | The skill being practiced |

**Response** (`EvaluateResponse`):

```json
{
  "subtext_accuracy": "You read her intent correctly: she is testing whether you will commit publicly.",
  "status_impact": "Maintained",
  "strategic_grade": "B",
  "strengths": ["Did not admit the bug", "Held the frame"],
  "critical_flaws": ["Gave away a soft date under pressure"],
  "the_rewritten_pro_move": "I can commit to a window once the readiness gates pass; I'll bring the criteria to the next review.",
  "coaching_tip": "Next turn, mirror her language and let her supply the number.",
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
  "detail": "Failed to generate the scenario."
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

All three pipelines use sampling temperature `0.7` to match the prototype; the evaluator additionally uses `ChainOfThought` for deeper reasoning.

---

## Shared models

### `ExecutiveEQSession`

Persistence contract for an executive EQ training session, managed by the client's session/memory app.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique session identifier |
| `user_role` | `string` | The role the user is playing |
| `narrative_arc` | `string` | The strategic goal |
| `learning_focus` | `string` | The EQ skill being practiced |
| `difficulty_level` | `string` | Intensity level of the simulation |
| `scenario_title` | `string` | Title of the generated scenario |
| `setting_description` | `string` | The scenario's setting |
| `npc_profile` | `object` | The counterpart profile (includes `hidden_motive` seed) |
| `initial_stakes` | `string` | Consequences of failure |
| `opening_hook` | `string` | The inciting incident |
| `chat_history` | `array[object]` | The dialogue so far |
| `grades` | `array[object]` | Evaluation history |
| `status_metric` | `string` | Rolling status position |
| `created_at` / `updated_at` | `datetime` | Timestamps |
| `is_active` | `bool` | Whether the session is active |
