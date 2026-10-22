# Vision Converter API

Base path: `/tools/vision`
Tag: `Vision Converter`

## Overview

A DSPy-driven vision tool that converts an uploaded image into high-quality, well-structured Markdown (preserving tables, headers, and lists). The image is stored to disk, compressed when larger than 1MB, and processed by a ChainOfThought vision pipeline.

The backend is **stateless** with respect to conversation state: each request converts a single image and returns the Markdown. The client owns the conversion history.

## Endpoints

### `POST /tools/vision/convert`

Converts an uploaded image to Markdown. Accepts `multipart/form-data`.

**Form fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | `file` | ✅ | The image to convert (must be `image/*`) |
| `instruction` | `string` | ❌ | What to extract (default `Convert the image to markdown.`) |

**Example request**:

```bash
curl -X POST http://localhost:8000/tools/vision/convert \
  -H "X-API-Key: <your-key>" \
  -F "file=@report.png" \
  -F "instruction=Extract all tables and headings."
```

**Response** (`VisionConversionResponse`):

```json
{
  "markdown_output": "# Q3 Financial Report\n\n| Metric | Value |\n|--------|-------|\n| Revenue | $1.2M |\n",
  "status": "success"
}
```

---

## Error responses

The endpoint returns a JSON body on failure.

| Status | Detail | Description |
|--------|--------|-------------|
| `400` | `File must be an image.` | Uploaded file is not an image |
| `401` | `Invalid or missing API key` | Missing/invalid `X-API-Key` header |
| `422` | `validation_error` | Multipart validation failed |
| `500` | `Failed to convert the image.` | Internal AI processing failure |

## Authentication

Optional `X-API-Key` header. When `API_KEY` is set in the environment, the server rejects requests without a matching key. When blank, the guard is disabled.

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `LLM_MODEL_NAME` | `gpt-4o-mini` | Model passed to DSPy |
| `LLM_API_KEY` | *(empty)* | Provider API key |
| `LLM_API_BASE` | `https://api.openai.com/v1` | OpenAI-compatible base URL |
| `LLM_TEMPERATURE` | `0.7` | Default sampling temperature |
| `VISION_STORAGE_DIR` | `Data/VisionConverter` | Where uploaded images are stored |
| `DEBUG` | `false` | FastAPI debug mode |
| `LOG_LEVEL` | `INFO` (`DEBUG` if `DEBUG=true`) | Logging verbosity |
| `HOST` / `PORT` | `0.0.0.0` / `8000` | Uvicorn bind address |

Uses sampling temperature `0.5` with ChainOfThought, matching the prototype.

---

## Shared models

### `VisionConversionRecord`

Persistence contract for a conversion record, managed by the client's session/memory app.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique record identifier |
| `filename` | `string` | Original uploaded filename |
| `file_path` | `string` | Stored image location |
| `instruction` | `string` | What was requested to be extracted |
| `markdown_output` | `string` | The converted Markdown string |
| `created_at` / `updated_at` | `datetime` | Timestamps |
