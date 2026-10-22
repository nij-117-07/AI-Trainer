# Vector Store Manager — API Reference

Base URL: `http://<host>:<port>/vector-store`

All endpoints accept and return JSON.

---

## 1. Create Collection

```
POST /vector-store/collections
```

Creates a new Qdrant collection. Returns 409 if it already exists.

### Request Body

```json
{
  "name": "my-collection",
  "vector_dim": 768,
  "distance": "Cosine"
}
```

| Field        | Type   | Default  | Description                                    |
|-------------|--------|----------|------------------------------------------------|
| `name`      | string | —        | Unique collection name (required)              |
| `vector_dim`| int    | `768`    | Embedding dimensionality                       |
| `distance`  | string | `Cosine` | Distance metric: `Cosine`, `Euclid`, or `Dot`  |

### Response `201`

```json
{
  "name": "my-collection",
  "vector_size": 768,
  "distance": "Distance.COSINE",
  "points_count": 0
}
```

### Errors

| Status | Meaning                                |
|--------|----------------------------------------|
| 409    | Collection with that name already exists|
| 422    | Invalid `distance` value               |

---

## 2. List Collections

```
GET /vector-store/collections
```

Returns metadata for every Qdrant collection.

### Response `200`

```json
{
  "collections": [
    {
      "name": "my-collection",
      "vector_size": 768,
      "distance": "Distance.COSINE",
      "points_count": 42
    }
  ]
}
```

---

## 3. Get Collection

```
GET /vector-store/collections/{name}
```

Returns detailed metadata for a single collection.

### Response `200`

```json
{
  "name": "my-collection",
  "vector_size": 768,
  "distance": "Distance.COSINE",
  "points_count": 42
}
```

### Errors

| Status | Meaning                     |
|--------|-----------------------------|
| 404    | Collection not found        |

---

## 4. Delete Collection

```
DELETE /vector-store/collections/{name}
```

Deletes a collection and all its stored vectors.

### Response `200`

```json
{
  "status": "success",
  "message": "Collection 'my-collection' has been deleted."
}
```

### Errors

| Status | Meaning                     |
|--------|-----------------------------|
| 404    | Collection not found        |

---

## 5. Upload Chunks

```
POST /vector-store/collections/{name}/chunks
```

Embeds text chunks using `nomic-ai/nomic-embed-text-v1.5` and upserts them into the collection.

### Request Body

```json
{
  "chunks": [
    {
      "text": "The quick brown fox jumps over the lazy dog.",
      "metadata": {
        "source": "example.txt",
        "page": 1
      }
    },
    {
      "text": "Python is a high-level programming language.",
      "metadata": {
        "source": "example.txt",
        "page": 2
      }
    }
  ]
}
```

| Field          | Type   | Description                                    |
|----------------|--------|------------------------------------------------|
| `chunks`       | array  | List of chunk objects (required, min 1)        |
| `chunks[].text`| string | Chunk text content                             |
| `chunks[].metadata` | object | Optional arbitrary metadata key-value pairs |

### Response `200`

```json
{
  "collection": "my-collection",
  "chunks_uploaded": 2
}
```

### Errors

| Status | Meaning                     |
|--------|-----------------------------|
| 404    | Collection not found        |
| 500    | Embedding generation failed |

---

## 6. Search

```
POST /vector-store/collections/{name}/search
```

Embeds the query and returns the nearest neighbour vectors with scores.

### Request Body

```json
{
  "query": "fox jumps over dog",
  "top_k": 5
}
```

| Field    | Type   | Default | Description                  |
|----------|--------|---------|------------------------------|
| `query`  | string | —       | Natural language query       |
| `top_k`  | int    | `10`    | Number of results (1–100)    |

### Response `200`

```json
{
  "results": [
    {
      "content": "The quick brown fox jumps over the lazy dog.",
      "score": 0.8921,
      "metadata": {
        "source": "example.txt",
        "page": 1
      }
    },
    {
      "content": "Python is a high-level programming language.",
      "score": 0.4532,
      "metadata": {
        "source": "example.txt",
        "page": 2
      }
    }
  ]
}
```

### Errors

| Status | Meaning                     |
|--------|-----------------------------|
| 404    | Collection not found        |
| 500    | Query embedding failed      |

---

## Configuration (Environment Variables)

| Variable            | Default                           | Description                  |
|---------------------|-----------------------------------|------------------------------|
| `QDRANT_HOST`       | `localhost`                       | Qdrant server host           |
| `QDRANT_PORT`       | `6333`                            | Qdrant server port           |
| `EMBEDDING_BASE_URL`| `http://10.35.151.101:8005/v1`    | OpenAI-compatible embedding API base |

---

## Integration

### Into Backend/main.py

```python
from vector_store.router import router as vector_store_router

app.include_router(vector_store_router)
```

### Standalone testing

```bash
python main.py
# Server starts at http://0.0.0.0:8010
```

### Quick test with curl

```bash
# Create a collection
curl -X POST http://localhost:8010/vector-store/collections \
  -H "Content-Type: application/json" \
  -d '{"name": "test-coll"}'

# Upload chunks
curl -X POST http://localhost:8010/vector-store/collections/test-coll/chunks \
  -H "Content-Type: application/json" \
  -d '{"chunks": [{"text": "Hello world", "metadata": {"source": "test"}}]}'

# Search
curl -X POST http://localhost:8010/vector-store/collections/test-coll/search \
  -H "Content-Type: application/json" \
  -d '{"query": "hello", "top_k": 5}'

# List collections
curl http://localhost:8010/vector-store/collections

# Delete collection
curl -X DELETE http://localhost:8010/vector-store/collections/test-coll
```
