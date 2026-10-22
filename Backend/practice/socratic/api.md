# Socratic Challenger API

Base path: `/practice/socratic`
Tag: `Socratic Challenger`

## Overview

A DSPy-driven Socratic questioning tool that challenges the user's reasoning rather than providing answers. It identifies logical fallacies, asks Popper-style falsification questions, constructs edge-case contradictions, and offers a more nuanced perspective. It targets intellectual humility, logical consistency, and argumentation skills.

The backend is **stateless**: it keeps no session state. A separate session/memory app owns the conversation history (and the fallacies found so far), and passes the accumulated exchanges back on each turn.

## Endpoints

### `POST /practice/socratic/challenge`

Processes a single turn of the Socratic dialogue.

**Request body** (`SocraticRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `conversation_history` | `array[string]` | ❌ | List of previous exchanges to maintain context |
| `user_statement` | `string` | ✅ | The user's latest opinion or rebuttal |
| `confidence_level` | `string` | ❌ | `low`, `medium`, `high`, `certain` (default `medium`) |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/socratic/challenge \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "conversation_history": [
      "User: Technology always improves human happiness.",
      "AI: What evidence would prove the opposite?"
    ],
    "user_statement": "Technology always improves human happiness.",
    "confidence_level": "high"
  }'
```

**Response** (`SocraticResponse`):

```json
{
  "logical_fallacy_check": "Hasty generalization",
  "falsification_question": "What single piece of evidence would convince you that a technology has, on balance, made people unhappier?",
  "edge_case_scenario": "What if the technology is an addictive product engineered to extract attention from vulnerable users?",
  "refined_perspective": "A more nuanced way to look at this might be: technology reshapes happiness, and the outcome depends on who designs it and who it is designed for.",
  "status": "success"
}
```

---

## Error responses

The endpoint returns a JSON body on failure.

| Status | Detail | Description |
|--------|--------|-------------|
| `401` | `Invalid or missing API key` | Missing/invalid `X-API-Key` header |
| `422` | `validation_error` | Pydantic request validation failed |
| `500` | `Failed to generate the socratic challenge.` | Internal AI processing failure |

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

Uses sampling temperature `0.4` (logical consistency) with ChainOfThought, matching the prototype.

---

## Shared models

### `SocraticSession`

Persistence contract for a socratic dialogue session, managed by the client's session/memory app.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique session identifier |
| `topic` | `string` | The topic under discussion |
| `conversation_history` | `array[string]` | The exchanges so far |
| `fallacies_found` | `array[string]` | Logical fallacies identified so far |
| `created_at` / `updated_at` | `datetime` | Timestamps |
| `is_active` | `bool` | Whether the session is active |
