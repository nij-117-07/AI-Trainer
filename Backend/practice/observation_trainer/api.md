# Observation Trainer API

Base path: `/practice/observation_trainer`
Tag: `Observation Trainer`

## Overview

Trains observation skills: the system generates a ground-truth description of an image (vision), evaluates what the user reports observing against that ground truth with a score/rating, and optionally reveals missed details with scenario-tailored training tips.

---

## Endpoints

### `POST /practice/observation_trainer/describe`

Generates a structured ground-truth description of an image.

**Request body** (`DescribeRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | `string` | ✅ | Image input — URL, base64 string, or file path |
| `scenario_context` | `string` | ❌ | Optional context about the image domain (e.g., `crime scene`, `medical scan`) |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/observation_trainer/describe \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "image": "https://example.com/images/room_scene_001.jpg",
    "scenario_context": "indoor crime scene"
  }'
```

**Response** (`DescribeResponse`):

```json
{
  "detailed_description": "A dimly lit room with a broken vase on the floor...",
  "key_elements": ["broken vase", "table", "open window", "chair"],
  "subtle_details": ["scattered glass shards", "footprint near the window"],
  "status": "success"
}
```

---

### `POST /practice/observation_trainer/evaluate`

Evaluates a user's observations against the ground truth of an image.

**Request body** (`EvaluateRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | `string` | ✅ | The image the user observed — URL, base64, or file path |
| `user_observations` | `string` | ✅ | What the user reported observing in the image |
| `training_scenario` | `string` | ✅ | The scenario/task the user is trained on (e.g., `Crime scene investigation`) |
| `context_category` | `string` | ❌ | Category of the image (e.g., `portrait`, `landscape`, `x-ray`) |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/observation_trainer/evaluate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "image": "https://example.com/images/room_scene_001.jpg",
    "user_observations": "I see a room with a broken vase. There is a table and a chair. The window is open.",
    "training_scenario": "Crime scene investigation — forensic evidence collection and scene documentation",
    "context_category": "indoor crime scene"
  }'
```

**Response** (`EvaluateResponse`):

```json
{
  "accuracy_assessment": "Your claims match the ground truth, but omit key evidence...",
  "scenario_relevance": "You noticed the open window, which is relevant to entry/exit analysis...",
  "rating": "Intermediate",
  "score": 6,
  "strengths": ["correctly identified the broken vase", "noted the open window"],
  "areas_for_improvement": ["trace evidence", "entry/exit indicators"],
  "scenario_feedback": "For forensic work, focus on positioning and disturbance patterns...",
  "feedback": "Good start! With more detail on positioning you will improve quickly.",
  "status": "success"
}
```

---

### `POST /practice/observation_trainer/reveal-hidden`

Reveals details the user likely missed, with scenario-tailored training tips.

**Request body** (`RevealHiddenRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | `string` | ✅ | The image being analyzed — URL, base64, or file path |
| `user_observations` | `string` | ✅ | What the user already noticed in the image |
| `training_scenario` | `string` | ✅ | The scenario/task determining which missed details matter most |
| `training_focus` | `string` | ❌ | Specific area to focus on (e.g., `background`, `lighting`, `patterns`) |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/observation_trainer/reveal-hidden \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "image": "https://example.com/images/room_scene_001.jpg",
    "user_observations": "I see a broken vase and an open window.",
    "training_scenario": "Forensic evidence collection",
    "training_focus": "trace evidence and entry/exit indicators"
  }'
```

**Response** (`RevealHiddenResponse`):

```json
{
  "missed_details": [
    {
      "detail": "Footprint near the window sill",
      "category": "foreground",
      "significance": "Potential entry point evidence",
      "scenario_priority": "high"
    }
  ],
  "potential_score": 8,
  "skill_gap": "You are not scanning low-contrast foreground regions...",
  "training_tip": "Split the image into a grid and inspect each quadrant...",
  "practice_exercise": "Describe a scene in under 60 seconds, forcing a scan order...",
  "encouragement": "You are building the right instinct — keep scanning systematically!",
  "status": "success"
}
```

---

### `POST /practice/observation_trainer/train`

Runs the full observation training pipeline in one call: describe → evaluate → reveal hidden details (optional).

**Request body** (`TrainRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | `string` | ✅ | The image the user observed — URL, base64, or file path |
| `user_observations` | `string` | ✅ | What the user reported observing in the image |
| `training_scenario` | `string` | ✅ | The scenario/task the user is trained on |
| `context_category` | `string` | ❌ | Category of the image |
| `training_focus` | `string` | ❌ | Specific area to focus on |
| `reveal_hidden` | `boolean` | ❌ | Whether to reveal missed details (default: `true`) |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/observation_trainer/train \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "image": "https://example.com/images/room_scene_001.jpg",
    "user_observations": "A room with a broken vase, a table, a chair, and an open window.",
    "training_scenario": "Crime scene investigation — forensic evidence collection",
    "context_category": "indoor crime scene",
    "training_focus": "trace evidence and entry/exit indicators",
    "reveal_hidden": true
  }'
```

**Response** (`TrainResponse`):

```json
{
  "image_analysis": {
    "ground_truth_description": "A dimly lit room with a broken vase on the floor...",
    "key_elements": ["broken vase", "table", "open window", "chair"],
    "subtle_details": ["scattered glass shards", "footprint near the window"]
  },
  "evaluation": {
    "accuracy_assessment": "Your claims match the ground truth, but omit key evidence...",
    "scenario_relevance": "You noticed the open window, which is relevant to entry/exit analysis...",
    "rating": "Intermediate",
    "score": 6,
    "strengths": ["correctly identified the broken vase", "noted the open window"],
    "areas_for_improvement": ["trace evidence", "entry/exit indicators"],
    "scenario_feedback": "For forensic work, focus on positioning and disturbance patterns...",
    "feedback": "Good start! With more detail on positioning you will improve quickly."
  },
  "hidden_details": {
    "missed_items": [
      {
        "detail": "Footprint near the window sill",
        "category": "foreground",
        "significance": "Potential entry point evidence",
        "scenario_priority": "high"
      }
    ],
    "potential_score": 8,
    "skill_gap": "You are not scanning low-contrast foreground regions...",
    "training_tip": "Split the image into a grid and inspect each quadrant...",
    "practice_exercise": "Describe a scene in under 60 seconds...",
    "encouragement": "You are building the right instinct — keep scanning systematically!"
  },
  "training_scenario": "Crime scene investigation — forensic evidence collection",
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
  "detail": "Failed to run the training pipeline."
}
```

## Authentication

Optional `X-API-Key` header. When `API_KEY` is set in the environment, the server rejects requests without a matching key. When blank, the guard is disabled.

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `LLM_MODEL_NAME` | `gpt-4o-mini` | Model passed to DSPy (use a vision-capable model for best image results) |
| `LLM_API_KEY` | *(empty)* | Provider API key |
| `LLM_API_BASE` | `https://api.openai.com/v1` | OpenAI-compatible base URL |
| `LLM_TEMPERATURE` | `0.7` | Sampling temperature |
| `DEBUG` | `false` | FastAPI debug mode |
| `LOG_LEVEL` | `INFO` (`DEBUG` if `DEBUG=true`) | Logging verbosity |
| `HOST` / `PORT` | `0.0.0.0` / `8000` | Uvicorn bind address |

---

## Shared models

### `ObservationTrainingSession`

Data contract for tracking an observation training session (persistence not yet wired up).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique session identifier |
| `image_ref` | `string` | Reference to the observed image (URL, base64, or path) |
| `training_scenario` | `string` | The scenario the user is trained on |
| `user_observations` | `string` | What the user reported observing |
| `rating` | `string` | Observation skill rating |
| `score` | `integer` | Observation score out of 10 |
| `missed_details_count` | `integer` | Number of hidden details revealed |
| `created_at` | `datetime` | Session creation timestamp |
| `updated_at` | `datetime` | Last-updated timestamp |
| `is_active` | `bool` | Whether the session is ongoing |
