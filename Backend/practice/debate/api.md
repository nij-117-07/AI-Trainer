# Debate Engine API

Base path: `/practice/debate`
Tag: `Debate`

## Overview

A DSPy-driven debate engine. It builds rich, character-driven debate personas, generates turn-by-turn arguments in the persona's voice, and judges completed debates with a full verdict.

The module is **stateless**: it keeps no session state. A separate session/memory app stores the persona profile and transcript and passes them back with every request.

## Flow

1. `POST /persona` → persist `persona` (keep `system_prompt`)
2. `POST /turn` — any number of times — each carries the persisted `system_prompt`, `topic`, growing `history`, and a `strategy`
3. `POST /judge` — sends both side transcripts for the verdict

---

## Endpoints

### `POST /practice/debate/persona`

Generates a specialized debate persona with a full strategic profile.

**Request body** (`PersonaRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `archetype` | `string` | ✅ | Character archetype (e.g., `Cynical Academic`, `Aggressive Trial Lawyer`) |
| `style` | `string` | ✅ | Speech style (e.g., `Sesquipedalian`, `punchy and short`, `data-driven`) |
| `intensity` | `integer` | ✅ | Rhetorical intensity 1-10 (1: passive, 10: high-stakes confrontation) |
| `influences` | `array[string]` | ✅ | Thinkers/schools of thought (e.g., `["Sartre", "Game Theory"]`) |
| `topic` | `string` | ✅ | Primary topic this persona will debate |
| `side` | `string` | ✅ | `pro` (in favor) or `con` (against) |
| `custom_constraints` | `string` | ❌ | Extra quirks (e.g., `Never uses emojis`) |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/debate/persona \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "archetype": "Cynical Academic",
    "style": "data-driven",
    "intensity": 7,
    "influences": ["Keynes", "Behavioral Economics"],
    "topic": "Universal Basic Income",
    "side": "con",
    "custom_constraints": "Never uses emojis"
  }'
```

**Response** (`PersonaResponse`) — persist the whole `persona` object:

```json
{
  "persona": {
    "persona_name": "Dr. Harrow",
    "system_prompt": "You are Dr. Harrow, a cynical academic...",
    "overall_stance": "defensive",
    "strategic_priorities": ["Attack evidence quality", "Stress fiscal cost", "Demand pilot data"],
    "core_values": ["Economic rigor", "Empirical proof"],
    "linguistic_quirks": ["Cites studies by author", "Uses dry humor"]
  },
  "status": "success"
}
```

---

### `POST /practice/debate/turn`

Generates a single debate turn in the persona's voice for a given strategy.

**Request body** (`DebateTurnRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `system_prompt` | `string` | ✅ | The persona definition (from the persona profile) |
| `topic` | `string` | ✅ | Core subject being debated |
| `context` | `string` | ❌ | General theme/background for the debate |
| `history` | `array[object]` | ❌ | Previous `{role, content}` exchanges |
| `strategy` | `string` | ✅ | One of: `attack`, `defend`, `counter` |
| `evidence` | `string` | ❌ | Supporting facts or raw data to anchor the argument |
| `instructions` | `string` | ❌ | Extra constraints (word count, tone, etc.) |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/debate/turn \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "system_prompt": "You are Dr. Harrow, a cynical academic...",
    "topic": "Universal Basic Income",
    "context": "Philosophical vs economic framing",
    "history": [
      {"role": "user", "content": "UBI would eliminate poverty."}
    ],
    "strategy": "counter",
    "evidence": "CBO 2023 fiscal projection",
    "instructions": "Keep it under 100 words."
  }'
```

**Response** (`DebateTurnResponse`) — append `{role, content}` with `spoken_argument` to the stored history:

```json
{
  "opponent_analysis": "The claim that UBI eliminates poverty assumes cost is irrelevant.",
  "core_claim": "Financing UBI would require cuts that recreate the poverty it claims to fix.",
  "reasoning_and_evidence": "CBO projections show a full UBI costing 2.9x current transfer spending...",
  "spoken_argument": "The poverty line is a ledger, and every credit needs a debit...",
  "rhetorical_devices": ["Logos", "Reductio ad absurdum"],
  "closing_question": "Show me a funded UBI pilot that reduced net poverty, not just gross.",
  "status": "success"
}
```

---

### `POST /practice/debate/judge`

Judges a completed debate between Pro and Con sides.

**Request body** (`JudgeRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topic` | `string` | ✅ | The original debate topic |
| `pro_transcript` | `string` | ✅ | Full transcript of Pro side's spoken arguments |
| `con_transcript` | `string` | ✅ | Full transcript of Con side's spoken arguments |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/debate/judge \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "topic": "Universal Basic Income",
    "pro_transcript": "UBI eliminates poverty...",
    "con_transcript": "Financing UBI requires cuts..."
  }'
```

**Response** (`JudgeResponse`):

```json
{
  "pro_score": 6,
  "con_score": 8,
  "strongest_argument": { "side": "con", "claim": "Financing UBI would require cuts that recreate poverty." },
  "weakest_argument": { "side": "pro", "claim": "UBI eliminates poverty." },
  "winner": "con",
  "reasoning": "The con side grounded its claims in fiscal evidence and directly refuted the pro's cost assumption.",
  "judge_comments": "Pro should engage with funding sources; con was precise but could vary delivery.",
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
  "detail": "Failed to execute the debate turn."
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

### `DebateSession`

Persistence contract for a debate session. Managed by the client's session/memory app.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique session identifier |
| `topic` | `string` | Core debate question |
| `context` | `string` | General theme/background |
| `persona` | `object` | The active persona profile |
| `side` | `string` | Persona's side: pro or con |
| `history` | `array[object]` | All previous `{role, content}` exchanges |
| `strategy_cycle` | `array[string]` | Turn strategies used in sequence |
| `pro_transcript` | `string` | Accumulated Pro-side spoken arguments |
| `con_transcript` | `string` | Accumulated Con-side spoken arguments |
| `winner` | `string` | Verdict: pro, con, or tie |
| `created_at` / `updated_at` | `datetime` | Timestamps |
| `is_active` | `bool` | Whether the session is ongoing |
