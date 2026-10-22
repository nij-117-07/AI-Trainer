# Ingredients Checker API

Base path: `/tools/ingredients`
Tag: `Ingredients Checker`

## Endpoints

### `POST /tools/ingredients/check`

Accepts a photo of a product's ingredients list and returns a nutritional health analysis. Uses the `multipart/form-data` encoding with a vision-capable DSPy model.

**Form fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | `binary` | ✅ | The ingredients image (`image/*`). Compressed automatically when larger than 1MB |
| `manual_text` | `string` | ❌ | Optional manual text of the ingredients if the image is blurry |

**Example request**:

```bash
curl -X POST http://localhost:8000/tools/ingredients/check \
  -H "X-API-Key: <your-key>" \
  -F "file=@/path/to/ingredients.jpg" \
  -F "manual_text=water, sugar, citric acid"
```

**Response** (`IngredientAnalysisResponse`):

```json
{
  "extracted_ingredients": ["sugar", "high fructose corn syrup", "citric acid"],
  "health_level": 2,
  "risk_factors": ["High sugar content", "Artificial sweetener"],
  "summary_analysis": "High sugar content and artificial preservatives...",
  "file_path": "Data/Ingredients/a1b2c3d4-....jpg",
  "status": "success"
}
```

**Response fields**:

| Field | Type | Description |
|-------|------|-------------|
| `extracted_ingredients` | `string[]` | List of detected ingredients |
| `health_level` | `int` | Assigned health level (1-5) |
| `risk_factors` | `string[]` | Concerning additives, allergens, or high-sugar items |
| `summary_analysis` | `string` | Why this health level was assigned |
| `file_path` | `string` | Path to the stored source image |
| `status` | `string` | Processing status (default: `success`) |

**Health level scale**:

| Level | Meaning |
|-------|---------|
| `1` | Ultra-processed / harmful additives (avoid) |
| `2` | High sugar/sodium or artificial preservatives |
| `3` | Moderately processed but generally safe |
| `4` | Whole foods with minimal processing |
| `5` | Organic / pure / highly nutritious (excellent) |

---

## Error responses

All endpoints return a JSON body on failure.

| Status | Detail | Description |
|--------|--------|-------------|
| `400` | `File must be an image.` | Uploaded file is not an image |
| `401` | `Invalid or missing API key` | Missing/invalid `X-API-Key` header |
| `422` | `validation_error` | Invalid multipart body (e.g. missing `file`) |
| `500` | `Failed to analyze the ingredients.` | Internal AI processing failure |

## Authentication

Optional `X-API-Key` header. When `API_KEY` is set in the environment, the server rejects requests without a matching key. When blank, the guard is disabled.

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `LLM_MODEL_NAME` | `gpt-4o-mini` | Vision-capable model passed to DSPy |
| `LLM_API_KEY` | *(empty)* | Provider API key |
| `LLM_API_BASE` | `https://api.openai.com/v1` | OpenAI-compatible base URL |
| `LLM_TEMPERATURE` | `0.7` | Sampling temperature (defaults to `0.1` for this module) |
| `INGREDIENTS_STORAGE_DIR` | `Data/Ingredients` | Directory where uploaded images are stored |

---

## Shared models

### `IngredientCheckRecord`

Data contract for tracking an ingredient health check (persistence not yet wired up).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique check identifier |
| `file_path` | `string` | Path to the stored source image |
| `extracted_ingredients` | `string[]` | Detected ingredients |
| `health_level` | `int` | Assigned health level (1-5) |
| `risk_factors` | `string[]` | Concerning items found |
| `summary_analysis` | `string` | Why this health level was assigned |
| `created_at` | `datetime` | Record creation timestamp |
| `updated_at` | `datetime` | Last-updated timestamp |
| `is_active` | `bool` | Whether the record is active |
