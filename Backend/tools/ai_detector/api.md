# AI Detector API

Base path: `/tools/ai_detector`
Tag: `AI Detector`

## Overview

A two-endpoint DSPy module for analyzing text and rewriting it so it reads like human-written content:

1. **Detect** — scores how likely a piece of text was AI-generated and explains why.
2. **Humanize** — rewrites AI-sounding text into natural, human-sounding prose, optionally using the detector's feedback and any extra user comments.

The backend is **stateless**: it keeps no history. The client is responsible for passing the text and any required context on every call (e.g., feeding a `/detect` response's `flagged_patterns` / `suggested_changes` into `/humanize` as `detection_feedback`).

## Endpoints

### `POST /tools/ai_detector/detect`

Analyzes text and reports how likely it was AI-generated.

**Request body** (`AIDetectionRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text_to_check` | `string` | ✅ | The text to analyze for AI-generated content (1–50,000 chars) |
| `additional_comments` | `string` | ❌ | Extra context — where the text came from, what tool wrote it, or specific concerns (max 2,000 chars) |

**Example request**:

```bash
curl -X POST http://localhost:8000/tools/ai_detector/detect \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "text_to_check": "Artificial intelligence has revolutionized numerous industries. Furthermore, it has enabled businesses to optimize their operations. In conclusion, AI continues to reshape the technological landscape.",
    "additional_comments": "This was submitted by a student for a blog assignment."
  }'
```

**Response** (`AIDetectionResponse`):

```json
{
  "ai_score": 0.93,
  "verdict": "Likely AI",
  "reason": "The passage relies heavily on formulaic transitions...",
  "flagged_patterns": [
    "Overuse of \"Furthermore\" / \"In conclusion\"",
    "Uniform sentence length and structure",
    "Generic, non-specific claims"
  ],
  "suggested_changes": [
    "Open with a concrete anecdote instead of a general claim",
    "Vary sentence length and drop the stock transitions"
  ]
}
```

**Response fields**:

| Field | Type | Description |
|-------|------|-------------|
| `ai_score` | `float` | AI probability from `0.0` (fully human) to `1.0` (fully AI) |
| `verdict` | `string` | One of `Likely AI`, `Likely Human`, `Mixed` |
| `reason` | `string` | Explanation citing specific phrases, structures, or patterns |
| `flagged_patterns` | `string[]` | Specific AI-telltale patterns detected |
| `suggested_changes` | `string[]` | Actionable tips to make the text sound more human |

---

### `POST /tools/ai_detector/humanize`

Rewrites AI-sounding text so it reads like it was written by a real person. Accepts `additional_comments` alongside `detection_feedback` so users can supply extra instructions (audience, phrasing to preserve, contextual constraints).

**Request body** (`HumanizerRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ai_text` | `string` | ✅ | The AI-sounding text to humanize (1–50,000 chars) |
| `target_tone` | `string` | ❌ | Desired tone: `casual`, `professional`, `conversational`, `academic`, `witty`, … (default: `"conversational"`, max 100 chars) |
| `detection_feedback` | `string` | ❌ | Feedback from the detector — `flagged_patterns` and `suggested_changes` to address (max 5,000 chars) |
| `additional_comments` | `string` | ❌ | Extra instructions from the user — preserve certain phrasing, target audience, or contextual constraints (max 2,000 chars) |

**Example request**:

```bash
curl -X POST http://localhost:8000/tools/ai_detector/humanize \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "ai_text": "Artificial intelligence has revolutionized numerous industries. Furthermore, it has enabled businesses to optimize their operations significantly.",
    "target_tone": "casual",
    "detection_feedback": "Flagged: overuse of \"Furthermore\", uniform sentence length.",
    "additional_comments": "Written by a college student for a personal blog — keep it under 80 words."
  }'
```

**Response** (`HumanizerResponse`):

```json
{
  "humanized_text": "AI has quietly reshaped how a lot of industries work... ",
  "changes_made": [
    "Removed the stock transition \"Furthermore\"",
    "Mixed short punchy sentences with longer ones",
    "Added a conversational opener"
  ],
  "confidence": 0.88
}
```

**Response fields**:

| Field | Type | Description |
|-------|------|-------------|
| `humanized_text` | `string` | The rewritten text that sounds natural and human-written |
| `changes_made` | `string[]` | Specific changes made and why they help |
| `confidence` | `float` | Confidence (`0.0`–`1.0`) that the text passes as human-written |

---

## Error responses

All endpoints return a JSON body on failure.

| Status | Detail | Description |
|--------|--------|-------------|
| `401` | `Invalid or missing API key` | Missing/invalid `X-API-Key` header |
| `422` | `validation_error` | Pydantic request validation failed |
| `500` | `Failed to analyze the text.` | Detection pipeline failure (`DetectionProcessingError`) |
| `500` | `Failed to humanize the text.` | Humanizer pipeline failure (`HumanizationProcessingError`) |

## Authentication

Optional `X-API-Key` header. When `API_KEY` is set in the environment, the server rejects requests without a matching key. When blank, the guard is disabled.

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `LLM_MODEL_NAME` | `gpt-4o-mini` | Model passed to DSPy |
| `LLM_API_KEY` | *(empty)* | Provider API key |
| `LLM_API_BASE` | `https://api.openai.com/v1` | OpenAI-compatible base URL |
| `LLM_TEMPERATURE` | `0.7` | Fallback sampling temperature |

Per-endpoint sampling: detection runs at temperature `0.2` (consistent scoring); humanizing runs at `0.7` (more natural, creative output).

---

## Shared models

### `DetectionRecord`

Persistence contract for a detection request (not yet wired up).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique detection identifier |
| `text_to_check` | `string` | The text that was analyzed |
| `additional_comments` | `string` | Extra context supplied by the user |
| `ai_score` | `float` | AI probability score (`0.0`–`1.0`) |
| `verdict` | `string` | `Likely AI`, `Likely Human`, or `Mixed` |
| `reason` | `string` | Explanation of the score |
| `flagged_patterns` | `string[]` | Detected AI tells |
| `suggested_changes` | `string[]` | Tips to make the text sound more human |
| `created_at` / `updated_at` | `datetime` | Timestamps |
| `is_active` | `bool` | Whether the record is active |

### `HumanizationRecord`

Persistence contract for a humanization request (not yet wired up).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique humanization identifier |
| `ai_text` | `string` | The original AI-sounding text |
| `target_tone` | `string` | Tone requested by the user |
| `detection_feedback` | `string` | Feedback from the AI Detector |
| `additional_comments` | `string` | Extra instructions supplied by the user |
| `humanized_text` | `string` | The rewritten, human-sounding text |
| `changes_made` | `string[]` | Changes applied |
| `confidence` | `float` | Pass-as-human confidence (`0.0`–`1.0`) |
| `created_at` / `updated_at` | `datetime` | Timestamps |
| `is_active` | `bool` | Whether the record is active |
