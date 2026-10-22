# Guides API

Base path: `/learning/guides`
Tag: `Guides`

## Endpoints

### `POST /learning/guides/task`

Generates a customized learning guide (mentor feedback + actionable tasks).

**Request body** (`GuideRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `subject` | `string` | ✅ | The subject being learned |
| `goal` | `string` | ✅ | The user's end goal |
| `current_level` | `string` | ✅ | The user's current skill level |
| `count` | `int` | ❌ | Number of tasks (1–10, default 3) |
| `history` | `array[string]` | ❌ | Tasks already completed |
| `instructions` | `string` | ❌ | Specific preferences |

**Example request**:

```bash
curl -X POST http://localhost:8000/learning/guides/task \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "subject": "FastAPI",
    "goal": "Become Python Expert",
    "current_level": "Intermediate",
    "count": 3,
    "history": [],
    "instructions": "Clean folder structure"
  }'
```

**Response** (`GuideResponse`):

```json
{
  "mentor_feedback": "Great progress on FastAPI fundamentals. These tasks push you into production patterns.",
  "tasks": [
    {
      "title": "Async SQLAlchemy CRUD API",
      "description": "Build a CRUD REST API with async SQLAlchemy and dependency injection.",
      "difficulty": "Medium",
      "learning_outcomes": ["Async patterns", "SQLAlchemy 2.0"],
      "estimated_hours": 6
    }
  ]
}
```

---

### `POST /learning/guides/daily-plan`

Generates a detailed daily study plan with roadmap, gap analysis, and exercises.

**Request body** (`DailyPlannerRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `master_topic` | `string` | ✅ | The broad field of study |
| `subtopic_preference` | `string` | ❌ | Specific area to focus on today |
| `user_level` | `string` | ✅ | One of: `beginner`, `intermediate`, `advanced` |
| `target_mastery` | `string` | ✅ | One of: `familiarity`, `competency`, `expert-level troubleshooting`, `architectural-design` |
| `existing_knowledge` | `string` | ✅ | What the user already knows |
| `learning_focus` | `string` | ✅ | One of: `practical`, `debugging`, `theoretical`, `project-based` |
| `history` | `string` | ❌ | Context from the previous session |

**Response** (`DailyPlannerResponse`):

```json
{
  "learning_objective": "Build a compound component pattern in React by end of day.",
  "mastery_gap_analysis": "You understand hooks but not context composition at scale.",
  "structured_roadmap": ["Review context API", "Design the compound API", "Build a slider"],
  "recommended_exercise": "Rebuild your existing form system using compound components.",
  "resource_suggestions": "React docs 'Compound Components' + Kent C. Dodds article."
}
```

---

### `POST /learning/guides/project-blueprint`

Generates a unique, industry-specific project blueprint.

**Request body** (`ProjectArchitectRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `master_topic` | `string` | ✅ | The broad field of study |
| `subtopic_focus` | `string` | ✅ | The specific niche to master |
| `target_mastery` | `string` | ✅ | The skill level to reach |
| `preferred_industry` | `string` | ❌ | The user's industry of choice |

**Response** (`ProjectArchitectResponse`):

```json
{
  "project_name": "MediSync Realtime Monitor",
  "industry_context": "Healthcare",
  "problem_statement": "Clinicians lack live telemetry for remote patient status.",
  "technical_requirements": ["WebSocket gateway", "HIPAA-compliant auth", "Live dashboard"],
  "stretch_goals": ["Anomaly detection", "Offline replay"],
  "validation_criteria": "Handle 10k concurrent connections under load.",
  "random_seed": "K7X2P9QD"
}
```

---

### `POST /learning/guides/suggest-topics`

Recommends next topics while avoiding previously suggested content.

**Request body** (`WhatToLearnRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `broader_topic` | `string` | ✅ | The general domain |
| `specific_interest` | `string` | ✅ | The specific sub-topic of interest |
| `learned_before` | `string` | ✅ | Background knowledge to build on |
| `previous_suggestions` | `array[string]` | ❌ | Topics already suggested (not repeated) |
| `custom_user_input` | `string` | ❌ | Specific constraints or requests |
| `topic_level` | `string` | ✅ | Difficulty (Beginner/Intermediate/Advanced) |

**Response** (`WhatToLearnResponse`):

```json
{
  "recommendations": [
    {
      "topic_name": "SQL Injection Prevention",
      "reason": "You asked for security focus; this builds directly on your Flask routing knowledge."
    }
  ]
}
```

---

### `POST /learning/guides/suggest-projects`

Generates strategic project use cases for a specific topic and industry.

**Request body** (`ProjectSuggestorRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topic` | `string` | ✅ | The core technology or subject matter |
| `industry` | `string` | ✅ | The vertical to apply the technology |
| `num_use_cases` | `int` | ❌ | Number of projects (1–10, default 3) |
| `user_instructions` | `string` | ❌ | Specific constraints or preferences |
| `existing_suggestions` | `array[string]` | ❌ | Project titles already suggested (not repeated) |

**Response** (`ProjectSuggestorResponse`):

```json
{
  "brief_strategy": "Vector search unlocks semantic patient-record retrieval across unstructured notes.",
  "projects": [
    {
      "title": "Semantic Trial Matcher",
      "problem": "Matching patients to clinical trials by hand is slow and error-prone.",
      "key_features": ["Embedding pipeline", "Hybrid search", "Eligibility filter"]
    }
  ]
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
  "detail": "Failed to generate the daily plan."
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

### `GuideSession`

Data contract for tracking a generated learning guide (persistence not yet wired up).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique guide session identifier |
| `subject` | `string` | The subject being learned |
| `goal` | `string` | The user's end goal |
| `current_level` | `string` | The user's skill level |
| `mentor_feedback` | `string` | The mentor's assessment and rationale |
| `tasks` | `array[GuideTaskRecord]` | The generated tasks |
| `created_at` | `datetime` | Generation timestamp |
| `is_active` | `bool` | Whether the session is active |
