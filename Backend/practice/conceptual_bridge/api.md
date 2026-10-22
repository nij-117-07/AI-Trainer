# Conceptual Bridge Builder API

Base path: `/practice/conceptual_bridge`
Tag: `Conceptual Bridge Builder`

## Overview

A DSPy-driven tool that forces connections between unrelated domains to train cognitive flexibility, analogical thinking, and knowledge transfer. Given two seemingly unrelated concepts, it produces a deep structural analogy, a bridging narrative, a question that forces the user to find the missing link, and a transfer-learning score.

The backend is **stateless**: it keeps no history. A separate session/memory app owns the user's bridge history and tracks their average flexibility score over time.

## Endpoints

### `POST /practice/conceptual_bridge/generate`

Builds a conceptual bridge between two unrelated concepts. Uses ChainOfThought for deep analogical reasoning, with a random seed for creative variation.

**Request body** (`BridgeRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `concept_a` | `string` | ✅ | First concept (e.g., `Photosynthesis`) |
| `concept_b` | `string` | ✅ | Second seemingly unrelated concept (e.g., `Blockchain`) |
| `abstraction_depth` | `string` | ❌ | `surface`, `structural`, `systemic` (default `structural`) |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/conceptual_bridge/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "concept_a": "Photosynthesis",
    "concept_b": "Blockchain",
    "abstraction_depth": "structural"
  }'
```

**Response** (`BridgeResponse`):

```json
{
  "structural_analogy": "Both are distributed validation systems: leaves validate sunlight and convert it to stored energy, just as nodes validate transactions and convert trust into stored value.",
  "bridging_narrative": "A leaf quietly absorbs sunlight while a thousand nodes quietly verify a transfer; neither works without distributed consent and neither can fake its output.",
  "insight_question": "What would a 'proof-of-work' plant look like, and what resource would it spend?",
  "cognitive_flexibility_score": 5,
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
| `500` | `Failed to build the conceptual bridge.` | Internal AI processing failure |

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

Uses sampling temperature `0.8` (creative) with ChainOfThought, matching the prototype.

---

## Shared models

### `ConceptualBridgeSession`

Persistence contract for a conceptual bridge session, managed by the client's session/memory app.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique session identifier |
| `user_interest` | `string` | The user's field of interest |
| `bridges` | `array[object]` | Concept pairs and their bridges |
| `average_flexibility_score` | `float` | Rolling average flexibility score |
| `created_at` / `updated_at` | `datetime` | Timestamps |
| `is_active` | `bool` | Whether the session is active |
