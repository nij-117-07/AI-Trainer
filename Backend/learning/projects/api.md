# Project Recommender API

Base path: `/learning/projects`
Tag: `Project Recommender`

## Endpoints

### `POST /learning/projects/generate`

Recommends practical, hands-on projects that help a learner master a given topic at their preferred scope and difficulty level.

**Request body** (`ProjectRecommenderRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topic` | `string` | ✅ | The subject or technology to practice (e.g., "Python API development", "React state management") |
| `project_size` | `string` | ✅ | One of: `small` (1-2 days), `medium` (1 week), `large` (2-4 weeks) |
| `difficulty_level` | `string` | ✅ | One of: `beginner`, `intermediate`, `advanced` |
| `num_recommendations` | `int` | ❌ | Number of project ideas to return (1-10, default: `3`) |

**Example request**:

```bash
curl -X POST http://localhost:8000/learning/projects/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "topic": "Python web scraping",
    "project_size": "medium",
    "difficulty_level": "intermediate",
    "num_recommendations": 3
  }'
```

**Response** (`ProjectRecommenderResponse`):

```json
{
  "projects": [
    {
      "title": "Price Watchdog CLI",
      "description": "A CLI tool that scrapes product pages, tracks price changes over time, and notifies you of drops.",
      "key_concepts": ["BeautifulSoup", "scheduled jobs", "CSV persistence"],
      "estimated_hours": 10,
      "prerequisites": ["Python basics", "HTML fundamentals"],
      "deliverables": ["Working CLI tool", "Price history report"],
      "stretch_goals": ["Email notifications", "Docker packaging"]
    }
  ],
  "advice": "Start by mapping the target page's HTML structure before writing any scraper code..."
}
```

**Response fields** (`ProjectRecommendation` per item):

| Field | Type | Description |
|-------|------|-------------|
| `title` | `string` | Clear, catchy project name |
| `description` | `string` | 2-3 sentence overview of what the learner will build |
| `key_concepts` | `string[]` | Core concepts/skills practiced |
| `estimated_hours` | `int` | Approximate hours to complete |
| `prerequisites` | `string[]` | Prior knowledge needed |
| `deliverables` | `string[]` | Concrete outputs |
| `stretch_goals` | `string[]` | Optional bonus challenges |

Plus the top-level `advice` field with encouraging guidance.

---

## Error responses

All endpoints return a JSON body on failure.

| Status | Detail | Description |
|--------|--------|-------------|
| `401` | `Invalid or missing API key` | Missing/invalid `X-API-Key` header |
| `422` | `validation_error` | Pydantic request validation failed |
| `500` | `Failed to generate the project recommendations.` | Internal AI processing failure |

## Authentication

Optional `X-API-Key` header. When `API_KEY` is set in the environment, the server rejects requests without a matching key. When blank, the guard is disabled.

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `LLM_MODEL_NAME` | `gpt-4o-mini` | Model passed to DSPy |
| `LLM_API_KEY` | *(empty)* | Provider API key |
| `LLM_API_BASE` | `https://api.openai.com/v1` | OpenAI-compatible base URL |
| `LLM_TEMPERATURE` | `0.7` | Sampling temperature |

---

## Shared models

### `ProjectRecommendationRecord`

Data contract for tracking a recommendation run (persistence not yet wired up).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique recommendation identifier |
| `topic` | `string` | The subject or technology to practice |
| `project_size` | `string` | Desired project scope |
| `difficulty_level` | `string` | Learner's proficiency |
| `projects` | `object[]` | The recommended projects |
| `advice` | `string` | Advice on how to approach the chosen project |
| `created_at` | `datetime` | Record creation timestamp |
| `updated_at` | `datetime` | Last-updated timestamp |
| `is_active` | `bool` | Whether the record is active |
