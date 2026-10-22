# Foresight Trainer API

Base path: `/practice/foresight_trainer`
Tag: `Foresight Trainer`

## Overview

A DSPy-driven "What would you do?" decision-making trainer. It drops the user into an immersive, multi-scene story and evaluates their reasoning as they make consequential choices, coaching their thinking across dimensions like foresight, empathy, creativity, risk awareness, and reasoning quality.

The module is **stateless**: it keeps no session state. A separate session/memory app persists the `blueprint`, the current scene, options, and the growing `decision_history`, passing them back with every request.

The scenario runs through up to `max_scenes` scenes. When the last scene is completed, a comprehensive progress report is generated.

## Flow

1. `POST /start` → persist `blueprint`, `max_scenes`, the opening `scene`, and `options`
2. `POST /decision` — once per scene — carries the persisted `blueprint`, `theme`, `scene_number`, `scene_narrative`, `options`, the chosen `choice` + `reasoning`, and the `decision_history`
3. Repeat until `scenario_complete: true`, which includes a final `progress_report`

---

## Endpoints

### `POST /practice/foresight_trainer/start`

Starts a new scenario: analyzes the user's context into a blueprint, generates the opening scene, and designs the first set of options.

**Request body** (`StartRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_context` | `string` | ✅ | Raw background context or scenario description |
| `main_theme` | `string` | ✅ | Core theme/skill to train (e.g., `strategic negotiation`) |
| `difficulty` | `string` | ❌ | `beginner`, `intermediate` (default), or `advanced` |
| `max_scenes` | `integer` | ❌ | Scene count before the progress report (default `5`, 1-20) |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/foresight_trainer/start \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "user_context": "You are a new CEO of a struggling solar startup with 3 months of runway.",
    "main_theme": "crisis management",
    "difficulty": "advanced",
    "max_scenes": 5
  }'
```

**Response** (`StartResponse`) — persist `blueprint`, `max_scenes`, `scene`, and `options`:

```json
{
  "scene": {
    "scene_narrative": "You are the CEO of Helios Solar...",
    "decision_point": "You must decide whether to accept the buyout offer now or hold out for a better deal.",
    "time_pressure": "You have 72 hours before the offer expires.",
    "difficulty_adjustment": null
  },
  "options": [
    {
      "id": "A",
      "title": "Accept the buyout",
      "description": "Take the offer and secure your team's future.",
      "approach_type": "cautious",
      "risk_level": "low",
      "time_cost": "fast",
      "hidden_tradeoff": "You give up equity upside and board control."
    }
  ],
  "custom_option_prompt": "None of these fit? Describe your own option...",
  "blueprint": {
    "setting": "A solar startup with 3 months of runway",
    "protagonist": "A newly appointed CEO",
    "core_conflict": "Accept a low buyout or gamble on turnaround",
    "stakes": "Company survival and employee livelihoods",
    "thinking_skill": "Crisis decision-making under uncertainty",
    "tone": "tense",
    "hidden_variables": ["A rival bidder is waiting in the wings", "A key client is about to sign"]
  },
  "max_scenes": 5,
  "status": "success"
}
```

---

### `POST /practice/foresight_trainer/decision`

Processes the user's choice: evaluates their reasoning, determines consequences, generates a coaching insight, and advances the story (or finalizes with a progress report on the last scene).

**Request body** (`DecisionRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `blueprint` | `object` | ✅ | The blueprint returned by `/start` |
| `theme` | `string` | ✅ | Original theme/skill being trained |
| `scene_number` | `integer` | ✅ | The current scene number |
| `scene_narrative` | `string` | ✅ | The scene the decision is made in |
| `options` | `array[object]` | ✅ | The options the user chose from |
| `choice` | `string` | ✅ | Option selected (A/B/C/D or custom) |
| `reasoning` | `string` | ✅ | The user's explanation of WHY they chose this |
| `decision_history` | `array[object]` | ❌ | Previous decisions (pass back what was returned last time) |
| `max_scenes` | `integer` | ❌ | Maximum scene count (default `5`) |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/foresight_trainer/decision \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "blueprint": { "setting": "A solar startup...", "hidden_variables": [] },
    "theme": "crisis management",
    "scene_number": 1,
    "scene_narrative": "You are the CEO of Helios Solar...",
    "options": [{ "id": "A", "title": "Accept the buyout", "approach_type": "cautious", "risk_level": "low", "time_cost": "fast" }],
    "choice": "A",
    "reasoning": "I want to protect the team and the three months of runway is too little to gamble with.",
    "decision_history": [],
    "max_scenes": 5
  }'
```

**Response** (`DecisionResponse`) — while `scenario_complete` is `false`, store `decision_history` and use `next_scene` + `next_options` for the next round:

```json
{
  "evaluation": {
    "scores": { "foresight": 7, "empathy": 8, "creativity": 4, "risk_awareness": 8, "reasoning_quality": 7 },
    "overall_score": 6.8,
    "strengths": ["Weighed stakeholder impact", "Acknowledged uncertainty"],
    "blind_spots": ["Did not consider the rival bidder", "Underweighted upside"],
    "thinking_pattern": "cautious optimizer",
    "one_lesson": "Safety first is admirable, but over-indexing on downside can cap upside."
  },
  "consequences": {
    "immediate_effects": ["The buyout closes at a discount", "Your team is retained"],
    "delayed_effects": ["A rival bidder later offers 40% more"],
    "hidden_reveal": "The rival bidder emerges a week after the deal",
    "new_complication": "Your top engineer wants to leave post-acquisition",
    "relationship_impact": "The board is relieved, investors are split",
    "resource_changes": "Cash secured, equity lost",
    "world_state_update": "The company is acquired; leadership now answers to a new parent."
  },
  "insight": {
    "pattern_observation": "You tend to optimize for safety over opportunity",
    "cognitive_bias_alert": "loss aversion",
    "strength_spotlight": "Clear prioritization of team well-being",
    "growth_edge": "Practicing optionality and asymmetric upside",
    "real_world_parallel": "Startup founders facing acquisition offers",
    "coaching_question": "What would you do if failure wasn't an option?"
  },
  "scenario_complete": false,
  "decision_history": [
    { "scene_number": 1, "choice_made": "A", "approach_type": "cautious optimizer", "scores": {}, "thinking_pattern": "cautious optimizer", "key_blind_spot": "Did not consider the rival bidder" }
  ],
  "progress_report": null,
  "next_scene": {
    "scene_narrative": "Six months later, the parent company is restructuring...",
    "decision_point": "You must decide whether to push back on the restructuring plan.",
    "time_pressure": "The plan lands on your desk on Friday.",
    "difficulty_adjustment": "Stakes raised: the buyout changed your leverage."
  },
  "next_options": [
    { "id": "A", "title": "Push back publicly", "approach_type": "assertive", "risk_level": "high", "time_cost": "slow", "hidden_tradeoff": "You may be replaced" }
  ],
  "custom_option_prompt": "None of these fit? Describe your own option...",
  "status": "success"
}
```

On the final scene, `scenario_complete` is `true`, `next_scene`/`next_options` are `null`, and `progress_report` is populated:

```json
{
  "evaluation": { "scores": {}, "overall_score": 7.2 },
  "consequences": {},
  "insight": {},
  "scenario_complete": true,
  "decision_history": [],
  "progress_report": {
    "overall_growth": "Across the crisis you moved from safety-first to calculated risk-taking...",
    "score_trajectory": { "foresight": [5, 7, 8], "risk_awareness": [6, 7, 8] },
    "dominant_pattern": "cautious optimizer",
    "underused_strengths": ["bold innovator", "consensus builder"],
    "critical_blind_spot": "Underweighting asymmetric upside",
    "best_moment": "Scene 3, where you negotiated a bridge round",
    "skill_assessment": "competent",
    "recommended_focus": "Practice high-ambiguity bets with bounded downside",
    "archetype": "The Cautious Visionary"
  },
  "next_scene": null,
  "next_options": null,
  "custom_option_prompt": null,
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
  "detail": "Failed to process the foresight decision."
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

The service uses two sampling temperatures internally: a creative LM (`0.8`) for scene/options/consequences and an analytical LM (`0.3`) for evaluation/insight/tracking.

---

## Shared models

### `ForesightSession`

Persistence contract for a foresight session. Managed by the client's session/memory app.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique session identifier |
| `theme` | `string` | Core theme/skill being trained |
| `difficulty` | `string` | `beginner`, `intermediate`, or `advanced` |
| `max_scenes` | `integer` | Scene count before the progress report |
| `blueprint` | `object` | The scenario blueprint from `/start` |
| `scene_number` | `integer` | The current scene number |
| `scene` | `object` | The current scene and decision point |
| `options` | `array[object]` | The options for the current scene |
| `decision_history` | `array[object]` | All recorded decisions and evaluations |
| `progress_report` | `object` | Final progress report when complete |
| `is_complete` | `bool` | Whether the scenario has finished |
| `created_at` / `updated_at` | `datetime` | Timestamps |
