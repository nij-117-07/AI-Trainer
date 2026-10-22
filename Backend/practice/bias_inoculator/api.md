# Cognitive Bias Inoculator API

Base path: `/practice/bias_inoculator`
Tag: `Cognitive Bias Inoculator`

## Overview

A DSPy-driven 'System 1 vs System 2' training tool (Kahneman's dual-process theory). It presents a stealthy scenario engineered to trigger a cognitive bias in the user, then reveals the trap: the intuitive (biased) answer, the rational System-2 analysis, and a practical tip for spotting the bias in real life. The reveal is returned alongside the scenario so the client can show it only after the user answers.

The backend is **stateless**: it keeps no session state. A separate session/memory app owns the user's reactions, the biases already covered, and the reveal flow.

## Endpoints

### `POST /practice/bias_inoculator/generate`

Creates a 'trap' scenario to train against cognitive biases.

**Request body** (`BiasRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `conversation_history` | `array[string]` | ❌ | Previous scenarios or user reactions |
| `user_interest` | `string` | ✅ | The user's field (e.g., `trading`, `dating`, `engineering`) |
| `target_bias` | `string` | ❌ | `anchoring`, `availability`, `confirmation`, `sunk_cost`, `framing`. If omitted, one is chosen randomly |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/bias_inoculator/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "conversation_history": [],
    "user_interest": "trading",
    "target_bias": "sunk_cost"
  }'
```

**Response** (`BiasResponse`):

```json
{
  "target_bias": "sunk_cost",
  "scenario_setup": "Your portfolio is down 40% on a stock you have held for two years. A new analysis shows the thesis is dead. What do you do: hold 'to break even' or cut the loss?",
  "intuitive_trap": "Hold, because selling locks in the loss and 'waits' for the price to recover.",
  "rational_analysis": "The sunk cost is unrecoverable. The only decision that matters is expected future return, which the new analysis shows is negative. Cutting is rational regardless of what you paid.",
  "real_world_application": "Before any 'let's keep it going' decision, ask: if I were starting from zero today, would I still choose this?",
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
| `500` | `Failed to generate the bias training scenario.` | Internal AI processing failure |

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

Uses sampling temperature `0.7` with ChainOfThought (to architect a believable 'trap'), matching the prototype.

---

## Shared models

### `BiasInoculatorSession`

Persistence contract for a bias training session, managed by the client's session/memory app.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique session identifier |
| `user_interest` | `string` | The user's field of interest |
| `trained_biases` | `array[string]` | Biases already covered |
| `scenario_history` | `array[object]` | Scenario + user response pairs |
| `created_at` / `updated_at` | `datetime` | Timestamps |
| `is_active` | `bool` | Whether the session is active |
