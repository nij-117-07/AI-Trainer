# Performance Grader API

Base path: `/assessment/grader`
Tag: `Performance Grader`

## Endpoints

### `POST /assessment/grader/evaluate`

Grades a user's submission (text, image, or both) against a target objective and returns a structured evaluation.

**Multipart form-data fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | `string` | ✅ | User identifier used for image storage |
| `scenario` | `string` | ✅ | The context of the task |
| `question_asked` | `string` | ✅ | The specific question the user is answering |
| `target_objective` | `string` | ✅ | The goal the user needs to achieve |
| `expected_level` | `string` | ✅ | The required depth (any value accepted) |
| `user_answer_text` | `string` | ❌ | The textual part of the user's response |
| `image` | `file` | ❌ | The visual part of the response (handwriting, diagram, screenshot) |

At least one of `user_answer_text` or `image` must be provided.

**Example request**:

```bash
curl -X POST http://localhost:8000/assessment/grader/evaluate \
  -H "X-API-Key: <your-key>" \
  -F "username=johndoe" \
  -F "scenario=Handle a difficult customer complaint" \
  -F "question_asked=How would you de-escalate this situation?" \
  -F "target_objective=Calm the customer and offer a resolution" \
  -F "expected_level=intermediate" \
  -F "user_answer_text=I would listen actively and offer a refund." \
  -F "image=@/path/to/answer.png"
```

**Response** (`GradingResponse`):

```json
{
  "combined_analysis": "The answer is empathetic and actionable, but lacks a concrete escalation step.",
  "score": 7.5,
  "strengths": ["Active listening", "Clear next action"],
  "weaknesses": ["No mention of a follow-up plan"],
  "detailed_feedback": "Add a concrete follow-up step to lock in the resolution.",
  "is_target_met": true,
  "status": "success"
}
```

## Error responses

All endpoints return a JSON body on failure.

| Status | Detail | Description |
|--------|--------|-------------|
| `400` | `File must be an image.` | Non-image content type on `image` |
| `400` | `Uploaded file is not a valid image.` | Bytes could not be decoded as an image |
| `401` | `Invalid or missing API key` | Missing/invalid `X-API-Key` header |
| `422` | `Provide either user_answer_text or an image to grade.` | Empty submission |
| `500` | `Failed to evaluate the submission.` | Internal AI processing failure |

**Example 500:**

```json
{
  "detail": "Failed to evaluate the submission."
}
```

## Authentication

Optional `X-API-Key` header. When `API_KEY` is set in the environment, the server rejects requests without a matching key. When blank, the guard is disabled.

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `GRADER_STORAGE_DIR` | `Data/Grader` | Directory where submitted images are persisted |
| `LLM_MODEL_NAME` | `gpt-4o-mini` | Model passed to DSPy |
| `LLM_API_KEY` | *(empty)* | Provider API key |
| `LLM_API_BASE` | `https://api.openai.com/v1` | OpenAI-compatible base URL |
| `LLM_TEMPERATURE` | `0.7` | Sampling temperature |
| `DEBUG` | `false` | FastAPI debug mode |
| `LOG_LEVEL` | `INFO` (`DEBUG` if `DEBUG=true`) | Logging verbosity |
| `HOST` / `PORT` | `0.0.0.0` / `8000` | Uvicorn bind address |

---

## Shared models

### `GradingRecord`

Data contract for tracking a graded submission (persistence not yet wired up).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique grading session identifier |
| `username` | `string` | User who submitted the answer |
| `scenario` | `string` | The context of the task |
| `question_asked` | `string` | The specific question answered |
| `target_objective` | `string` | The goal the user needed to achieve |
| `expected_level` | `string` | Required depth |
| `score` | `float` | AI score from 0.0 to 10.0 |
| `is_target_met` | `bool` | Whether the objective was achieved |
| `strengths` | `array[string]` | Positive aspects of the submission |
| `weaknesses` | `array[string]` | Gaps or errors found |
| `detailed_feedback` | `string` | Constructive advice for improvement |
| `image_path` | `string` | Persisted copy of the submitted image, if any |
| `created_at` | `datetime` | Grading timestamp |
| `is_active` | `bool` | Whether the record is active |
