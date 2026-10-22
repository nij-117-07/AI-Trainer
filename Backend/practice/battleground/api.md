# Battleground Simulator API

Base path: `/practice/battleground`
Tag: `Battleground Simulator`

## Overview

A DSPy-driven tactical battleground simulator. The user gets a structured combat profile, faces a tailored adversary that adapts to their choices, and works through round-based missions evaluated on tactical effectiveness.

The backend is **stateless**: it keeps no session state. A separate session/memory app owns the game state — HP, round number, opponent learning log, resources, scores — and passes the relevant fields back on each call. The session contract in `models.py` (`BattlegroundSession`) mirrors the state the webapp must persist.

## Game flow (webapp orchestrates)

1. `POST /init` → persist the full setup (profiles, environment, mission, initial HP, loadout)
2. `POST /challenge` → return the round's challenge to the user (webapp stores `updated_learning_log`)
3. `POST /evaluate` → apply `hp_delta_user` / `hp_delta_opponent` / `resource_impact` to the persisted session; increment `round_number`; loop back to `/challenge`
4. Terminate when user HP ≤ 0, opponent HP ≤ 0, or `is_terminated` is true — then show `termination_reason` and the final score average

---

## Endpoints

### `POST /practice/battleground/init`

Builds the user profile, generates the opponent, and designs the scenario.

**Request body** (`BattleStartRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | ❌ | Callsign or preferred name (default `Commander`) |
| `expertise` | `string` | ❌ | Area of expertise (e.g., `cybersecurity`, `tactics`) |
| `preferred_style` | `string` | ❌ | Combat style (e.g., `aggressive`, `defensive`, `stealth`) |
| `background` | `string` | ❌ | Background story or experience |
| `custom_notes` | `string` | ❌ | Any additional context |
| `topic` | `string` | ✅ | Battleground domain (e.g., `Cybersecurity Ransomware Attack`) |
| `difficulty` | `string` | ❌ | `easy`, `medium` (default), or `hard` |
| `theme` | `string` | ❌ | Overall tone (defaults to `topic`) |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/battleground/init \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "name": "Viper",
    "expertise": "cybersecurity",
    "preferred_style": "defensive",
    "background": "10 years SOC analyst",
    "topic": "Cybersecurity Ransomware Attack",
    "difficulty": "hard"
  }'
```

**Response** (`BattleStartResponse`) — persist everything:

```json
{
  "user_profile": {
    "callsign": "Viper",
    "rank": "Major",
    "specializations": ["Threat hunting", "Incident response"],
    "strengths": ["Log analysis", "Composure under pressure"],
    "weaknesses": ["Over-relies on defensive posture"],
    "available_loadout": ["EDR tools", "Threat intel feed"],
    "combat_doctrine": "Contain first, engage only with certainty."
  },
  "opponent_profile": {
    "name": "Sovereign",
    "title": "Ransomware Syndicate Leader",
    "capabilities": { "infiltration": 9, "evasion": 8, "social_engineering": 7 },
    "motives": "Maximize ransom payments through panic",
    "personality": ["Methodical", "Patient", "Punishes hesitation"],
    "adaptability_style": "pattern recognizer",
    "signature_tactics": ["Lateral movement", "Encryption blitz"],
    "weaknesses": ["Predictable escalation cadence"],
    "available_resources": ["Botnet", "Initial access brokers"]
  },
  "opponent_strategy": "Sow chaos early to force rushed containment decisions...",
  "opponent_first_impression": "Target is defensive; likely to contain rather than counter...",
  "scenario_context": "At 0200 your SIEM flags an encryption wave...",
  "battlefield_environment": {
    "terrain": "Hybrid on-prem + cloud estate",
    "weather_conditions": "Heavy alert noise from thousands of endpoints",
    "time_of_day": "0200",
    "hazards": "Unknown backdoor persistence",
    "strategic_points": ["Domain controller", "Backup vault"]
  },
  "evaluation_criteria": {
    "tactical_accuracy": "How well the response addresses the threat",
    "resource_efficiency": "Conservation of assets while achieving objectives",
    "adaptability": "Handling unexpected developments"
  },
  "mission_objective": "Stop the encryption wave and recover critical systems within 48 hours.",
  "rules_of_engagement": ["Minimize downtime", "Preserve forensic evidence", "No payments without authorization"],
  "initial_user_health": 90,
  "initial_opponent_health": 95,
  "user_resources": { "EDR tools": 1, "Threat intel feed": 1 },
  "status": "success"
}
```

---

### `POST /practice/battleground/challenge`

The opponent picks a tactic and the scenario director frames the round's challenge.

**Request body** (`BattleChallengeRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `opponent_profile` | `object` | ✅ | Opponent's capabilities and traits |
| `battlefield_environment` | `object` | ✅ | Current environment state |
| `user_health` | `integer` | ✅ | Current user HP (0-100) |
| `opponent_health` | `integer` | ✅ | Current opponent HP (0-100) |
| `previous_user_action` | `string` | ❌ | What the user did last round (default `None yet`) |
| `previous_score` | `number` | ❌ | Last round score (default `0.5`) |
| `round_number` | `integer` | ❌ | Current round (default `1`) |
| `opponent_learning_log` | `string` | ❌ | Stored learning log from the last `/challenge` |
| `user_profile` | `object` | ✅ | The user's known strengths and weaknesses |
| `scenario_context` | `string` | ✅ | Overall battleground narrative |

**Response** (`BattleChallengeResponse`) — show the challenge, store `updated_learning_log` for next time:

```json
{
  "tactic_type": "electronic_warfare",
  "briefing": "Alert noise spikes as the adversary probes your monitoring stack...",
  "tactical_situation": "Your visibility is degrading; SIEM rule misses rise sharply.",
  "challenge": "Identify the blind spot the adversary is exploiting and restore visibility.",
  "question": "Where do you cut losses and where do you hold ground?",
  "constraints": ["No network-wide lockdown", "Resolve within 4 hours"],
  "reference_material": {
    "system_logs": "Auth failures spiking on the domain controller...",
    "intercepted_comms": "Unencrypted chatter hints at a second entry point."
  },
  "updated_learning_log": "Target hesitates under noise; respond with escalation bait...",
  "environment_change": "Visibility reduced across the northern segments.",
  "status": "success"
}
```

---

### `POST /practice/battleground/evaluate`

Adjudicates the user's response: score, feedback, HP deltas, resource changes, and termination state.

**Request body** (`BattleEvaluateRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `scenario_context` | `string` | ✅ | Overall battleground narrative |
| `battlefield_environment` | `object` | ✅ | Current environment |
| `evaluation_criteria` | `object` | ✅ | Scoring metrics from `/init` |
| `current_challenge` | `string` | ✅ | What the user was asked to do |
| `main_question` | `string` | ✅ | The primary problem posed |
| `reference_material` | `object` | ✅ | Intel provided to the user |
| `user_response` | `string` | ✅ | The user's actual response/action |
| `user_health` | `integer` | ✅ | Current user HP |
| `opponent_health` | `integer` | ✅ | Current opponent HP |
| `user_profile` | `object` | ✅ | The user's capabilities |
| `opponent_profile` | `object` | ✅ | The opponent's capabilities |
| `tactic_used` | `string` | ✅ | The opponent's tactic this round (from `/challenge`) |

**Response** (`BattleEvaluateResponse`) — apply the deltas in the webapp:

```json
{
  "score": 0.74,
  "feedback": "Strong containment instinct, but you committed your only network-segment quarantine early...",
  "narrative": "The adversary pivots before your containment fully lands...",
  "battlefield_shift": "The second entry point is now active; the backup vault is being probed.",
  "hp_delta_user": -15,
  "hp_delta_opponent": -20,
  "resource_impact": { "Threat intel feed": -1 },
  "is_terminated": false,
  "termination_reason": "",
  "status": "success"
}
```

When `is_terminated` is true (or either HP reaches 0 after applying deltas), end the simulation and show `termination_reason` plus the average score.

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
  "detail": "Failed to evaluate the battleground response."
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
| `LLM_TEMPERATURE` | `0.7` | Default sampling temperature (battleground uses `0.4`) |
| `DEBUG` | `false` | FastAPI debug mode |
| `LOG_LEVEL` | `INFO` (`DEBUG` if `DEBUG=true`) | Logging verbosity |
| `HOST` / `PORT` | `0.0.0.0` / `8000` | Uvicorn bind address |

---

## Shared models

### `BattlegroundSession`

Persistence contract for a battleground session, managed by the client's session/memory app. Every field is round-tripped from the API responses.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique session identifier |
| `topic` / `difficulty` | `string` | Battleground domain and difficulty |
| `user_details` | `object` | Raw user-provided details |
| `user_profile` | `object` | Structured combat profile |
| `user_health` | `integer` | Current user HP |
| `user_resources` | `object` | User's available resources |
| `opponent_profile` / `opponent_strategy` / `opponent_first_impression` | `object`/`string` | Opponent state |
| `opponent_health` | `integer` | Current opponent HP |
| `opponent_learning_log` | `string` | Accumulated observations about the user |
| `scenario_context` / `battlefield_environment` / `evaluation_criteria` | `object` | Scenario state |
| `mission_objective` / `rules_of_engagement` | `string`/`array` | Mission definition |
| `round_number` | `integer` | Current round |
| `current_challenge` | `object` | The active challenge |
| `round_scores` | `array[number]` | Per-round scores |
| `is_active` / `termination_reason` | `bool`/`string` | Completion state |
