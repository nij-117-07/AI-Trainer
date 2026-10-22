import os
import logging
from qdrant_client import QdrantClient
from openai import OpenAI

logger = logging.getLogger(__name__)

EMBEDDING_MODEL: str = "nomic-ai/nomic-embed-text-v1.5"
VECTOR_DIM: int = 768

QDRANT_HOST: str = os.environ.get("QDRANT_HOST", "localhost")
QDRANT_PORT: int = int(os.environ.get("QDRANT_PORT", "6333"))
EMBEDDING_BASE_URL: str = os.environ.get(
    "EMBEDDING_BASE_URL", "http://10.35.151.101:8005/v1"
)

EMBEDDING_BASE_URL = "http://localhost:18053/v1"

qdrant_client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)
embedding_client = OpenAI(base_url=EMBEDDING_BASE_URL, api_key="not-needed")

logger.info(
    "Vector store clients initialized: Qdrant(%s:%s), Embedding(%s)",
    QDRANT_HOST, QDRANT_PORT, EMBEDDING_BASE_URL,
)
