# Resource Suggestor API

Base path: `/learning/resource_suggestor`
Tag: `Resource Suggestor`

## Overview

A DSPy-driven, personalized learning resource recommendation engine. Given a learner's current background and a target topic, it produces a curated list of resources, a learning path summary, and actionable next steps.

The module is **stateless**: it keeps no session state. A separate session/memory app persists the learner profile and past recommendations if needed.

## Flow

1. Call `POST /suggest` with `background_subject` + `target_topic` (optionally `additional_preferences`)
2. Display the `learning_path_summary`, the `recommended_resources` list, and `next_steps`
3. Optionally persist the response for the learner's progress tracking

---

## Endpoints

### `POST /learning/resource_suggestor/suggest`

Generates personalized learning resource recommendations.

**Request body** (`ResourceSuggestRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `background_subject` | `string` | Yes | The subject or domain the user currently studies or has knowledge in |
| `target_topic` | `string` | Yes | The specific topic or skill the user wants to learn |
| `additional_preferences` | `string` | No | Learning style, time commitment, difficulty, format, language, or other constraints |

**Example request**:

```bash
curl -X POST http://localhost:8000/learning/resource_suggestor/suggest \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "background_subject": "Python programming and basic statistics",
    "target_topic": "Machine Learning and Deep Learning",
    "additional_preferences": "I prefer video tutorials and hands-on projects. I can dedicate 10 hours per week. Looking for free resources initially."
  }'
```

**Response** (`ResourceSuggestResponse`):

```json
{
  "learning_path_summary": "Start with foundational ML concepts using Python-friendly resources, then progress to deep learning frameworks. Leverage your statistics background to skip early probability basics.",
  "recommended_resources": [
    {
      "title": "Machine Learning Specialization",
      "type": "online_course",
      "author_or_creator": "Andrew Ng / Stanford / DeepLearning.AI",
      "description": "A comprehensive introduction to ML algorithms, supervised learning, unsupervised learning, and best practices.",
      "difficulty_level": "beginner",
      "estimated_time": "3 months",
      "why_recommended": "Perfect bridge from Python/stats to ML with hands-on Python notebooks.",
      "prerequisite_knowledge": "Basic Python, introductory statistics",
      "access_info": "Coursera (free to audit)"
    }
  ],
  "next_steps": "Complete the Machine Learning Specialization first, then move to the Deep Learning Specialization. After that, pick a specialization track based on your interest area.",
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
| `500` | `Failed to generate resource suggestions.` | Internal AI processing failure |

## Authentication

Optional `X-API-Key` header. When `API_KEY` is set in the environment, the server rejects requests without a matching key. When blank, the guard is disabled.

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `LLM_MODEL_NAME` | `gpt-4o-mini` | Model passed to DSPy |
| `LLM_API_KEY` | *(empty)* | Provider API key |
| `LLM_API_BASE` | `https://api.openai.com/v1` | OpenAI-compatible base URL |
| `LLM_TEMPERATURE` | `0.7` | Default sampling temperature (resource suggestor uses `0.7`) |
| `DEBUG` | `false` | FastAPI debug mode |
| `LOG_LEVEL` | `INFO` (`DEBUG` if `DEBUG=true`) | Logging verbosity |
| `HOST` / `PORT` | `0.0.0.0` / `8000` | Uvicorn bind address |

---

## Shared models

### `ResourceSuggestSession`

Persistence contract for a resource suggestion session, managed by the client's session/memory app.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique session identifier |
| `background_subject` | `string` | The user's current background or subject area |
| `target_topic` | `string` | The topic the user wants to learn |
| `additional_preferences` | `string` | Optional learning preferences and constraints |
| `created_at` / `updated_at` | `datetime` | Timestamps |
| `is_active` | `bool` | Whether the session is active |

---

## Implementation notes

- **DSPy Signature**: `ResourceSuggestor` defines three input fields (`background_subject`, `target_topic`, `additional_preferences`) and three output fields (`learning_path_summary`, `recommended_resources`, `next_steps`).
- **Resource schema**: Each resource in `recommended_resources` contains 9 fields: `title`, `type`, `author_or_creator`, `description`, `difficulty_level`, `estimated_time`, `why_recommended`, `prerequisite_knowledge`, `access_info`.
- **Chain-of-thought**: The predictor uses `dspy.ChainOfThought` (or `dspy.Predict` when `MODEL_NATIVE_COT=true`) to reason about resource selection.
