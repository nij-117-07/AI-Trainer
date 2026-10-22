# Skill Architect API

Base path: `/learning/skill_architect`
Tag: `Skill Architect`

## Overview

A DSPy-driven skill deconstruction engine. It acts as a "Root Skill Teller": instead of a generic syllabus, it breaks a domain down into its fundamental root skills and arranges them into a strict, level-wise progression tree (e.g., Level 1: The Roots, Level 2: The Trunk, Level 3: The Branches, Level 4: Mastery).

Each level defines the core competencies, the underlying mechanics ("hidden rules"), a proof of mastery, and the exact condition to unlock the next level. The response also surfaces the critical bottleneck that makes most people plateau and tactical advice to accelerate.

The module is **stateless**: it keeps no session state. A separate session/memory app stores the generated skill tree.

## Endpoints

### `POST /learning/skill_architect/generate`

Deconstructs a domain or skill into a root-skill progression tree.

**Request body** (`SkillArchitectRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `domain_or_skill` | `string` | ✅ | The main subject, craft, or profession to master |
| `current_proficiency` | `string` | ✅ | Current level (e.g., `absolute beginner`, `self-taught`, `intermediate`) |
| `target_mastery_level` | `string` | ✅ | Desired end goal (e.g., `Competent Professional`, `Industry Expert`, `Master`) |
| `learning_constraints` | `string` | ❌ | Time, resources, or preferred learning style |

**Example request**:

```bash
curl -X POST http://localhost:8000/learning/skill_architect/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "domain_or_skill": "System Design and Software Architecture",
    "current_proficiency": "Junior Developer with 1 year of experience",
    "target_mastery_level": "Staff Engineer / Principal Architect",
    "learning_constraints": "I only have 5 hours a week to study."
  }'
```

**Response** (`SkillArchitectResponse`):

```json
{
  "core_philosophy": "System design is the art of making trade-offs explicit...",
  "skill_tree_levels": [
    {
      "level_name": "Level 1: The Roots — Foundations",
      "root_skills": ["OS concepts", "Networking basics", "Data structures"],
      "how_it_works": "Every system is constrained by the hardware it runs on...",
      "proof_of_mastery": "Build a thread-safe in-memory cache with a load test",
      "unlock_condition": "Can explain how a network request travels end-to-end"
    },
    {
      "level_name": "Level 2: The Trunk — Core Patterns",
      "root_skills": ["Caching", "Queueing", "Database indexing"],
      "how_it_works": "Systems fail at scale through bottlenecks, not bugs...",
      "proof_of_mastery": "Design and present a scalable chat backend",
      "unlock_condition": "Can identify the bottleneck in a given architecture"
    }
  ],
  "critical_bottleneck": "Most engineers never learn to model latency budgets...",
  "strategic_navigation": "Practice by designing systems under strict constraints...",
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
  "detail": "Failed to generate the root-skill tree."
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
| `LLM_TEMPERATURE` | `0.7` | Default sampling temperature (skill architect uses `0.4`) |
| `DEBUG` | `false` | FastAPI debug mode |
| `LOG_LEVEL` | `INFO` (`DEBUG` if `DEBUG=true`) | Logging verbosity |
| `HOST` / `PORT` | `0.0.0.0` / `8000` | Uvicorn bind address |

---

## Shared models

### `SkillArchitectSession`

Persistence contract for a skill tree session. Managed by the client's session/memory app.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique session identifier |
| `domain_or_skill` | `string` | The subject, craft, or profession |
| `current_proficiency` | `string` | The user's current level |
| `target_mastery_level` | `string` | The desired end goal |
| `learning_constraints` | `string` | Time, resource, or style constraints |
| `core_philosophy` | `string` | The fundamental mental model of the domain |
| `skill_tree_levels` | `array[object]` | The structured, level-wise progression tree |
| `critical_bottleneck` | `string` | The root concept most people fail to grasp |
| `strategic_navigation` | `string` | Actionable practice and acceleration advice |
| `created_at` / `updated_at` | `datetime` | Timestamps |
| `is_active` | `bool` | Whether the session is active |
