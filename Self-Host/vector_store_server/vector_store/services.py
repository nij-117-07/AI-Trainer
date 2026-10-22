import uuid
import logging
from typing import List

from fastapi import HTTPException, status
from qdrant_client.http import models as qdrant_models

from vector_store.dependencies import (
    qdrant_client,
    embedding_client,
    EMBEDDING_MODEL,
    VECTOR_DIM,
)
from vector_store.schemas import (
    ChunkItem,
    CollectionResponse,
    CollectionListResponse,
    SearchResultItem,
    SearchResponse,
)
from vector_store.models import build_payload

logger = logging.getLogger(__name__)


class VectorStoreManager:
    """Business logic for Qdrant vector store operations.

    All methods are static to remain stateless and easily testable.
    """

    @staticmethod
    def collection_exists(name: str) -> bool:
        """Check whether a collection exists in Qdrant.

        Args:
            name: Collection name to check.

        Returns:
            True if the collection exists, False otherwise.
        """
        collections = qdrant_client.get_collections().collections
        return any(c.name == name for c in collections)

    @staticmethod
    def _raise_if_missing(name: str) -> None:
        """Raise 404 if the collection does not exist.

        Args:
            name: Collection name to verify.

        Raises:
            HTTPException: 404 if not found.
        """
        if not VectorStoreManager.collection_exists(name):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Collection '{name}' not found.",
            )

    @staticmethod
    def _distance_from_string(distance: str) -> qdrant_models.Distance:
        """Map a distance string to a Qdrant Distance enum.

        Args:
            distance: One of 'Cosine', 'Euclid', 'Dot'.

        Returns:
            Corresponding qdrant_models.Distance value.

        Raises:
            HTTPException: 422 if the distance metric is unknown.
        """
        mapping = {
            "Cosine": qdrant_models.Distance.COSINE,
            "Euclid": qdrant_models.Distance.EUCLID,
            "Dot": qdrant_models.Distance.DOT,
        }
        if distance not in mapping:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Unknown distance metric '{distance}'. Use Cosine, Euclid, or Dot.",
            )
        return mapping[distance]

    @staticmethod
    def create_collection(name: str, vector_dim: int = VECTOR_DIM, distance: str = "Cosine") -> CollectionResponse:
        """Create a new Qdrant collection if it does not already exist.

        Args:
            name: Unique collection name.
            vector_dim: Dimensionality of vectors (default 768 for nomic-embed-text-v1.5).
            distance: Distance metric string (Cosine, Euclid, Dot).

        Returns:
            CollectionResponse with collection metadata.

        Raises:
            HTTPException: 409 if the collection already exists.
        """
        if VectorStoreManager.collection_exists(name):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Collection '{name}' already exists.",
            )

        distance_enum = VectorStoreManager._distance_from_string(distance)

        qdrant_client.create_collection(
            collection_name=name,
            vectors_config=qdrant_models.VectorParams(
                size=vector_dim,
                distance=distance_enum,
            ),
        )
        logger.info("Created collection '%s' (dim=%s, distance=%s)", name, vector_dim, distance)

        return VectorStoreManager.get_collection(name)

    @staticmethod
    def list_collections() -> CollectionListResponse:
        """Retrieve metadata for all existing Qdrant collections.

        Returns:
            CollectionListResponse containing a list of CollectionResponse objects.
        """
        response = qdrant_client.get_collections()
        collections = []
        for alias_info in response.collections:
            try:
                info = qdrant_client.get_collection(alias_info.name)
                collections.append(
                    CollectionResponse(
                        name=alias_info.name,
                        vector_size=info.config.params.vectors.size,
                        distance=str(info.config.params.vectors.distance),
                        points_count=info.points_count,
                    )
                )
            except Exception as e:
                logger.warning("Failed to fetch details for '%s': %s", alias_info.name, e)
                collections.append(
                    CollectionResponse(
                        name=alias_info.name,
                        vector_size=0,
                        distance="Unknown",
                        points_count=0,
                    )
                )
        return CollectionListResponse(collections=collections)

    @staticmethod
    def get_collection(name: str) -> CollectionResponse:
        """Get metadata for a single collection.

        Args:
            name: Collection name.

        Returns:
            CollectionResponse with collection details.

        Raises:
            HTTPException: 404 if not found.
        """
        VectorStoreManager._raise_if_missing(name)
        info = qdrant_client.get_collection(name)
        return CollectionResponse(
            name=name,
            vector_size=info.config.params.vectors.size,
            distance=str(info.config.params.vectors.distance),
            points_count=info.points_count,
        )

    @staticmethod
    def delete_collection(name: str) -> None:
        """Delete a Qdrant collection.

        Args:
            name: Collection name to delete.

        Raises:
            HTTPException: 404 if not found.
        """
        VectorStoreManager._raise_if_missing(name)
        qdrant_client.delete_collection(collection_name=name)
        logger.info("Deleted collection '%s'", name)

    @staticmethod
    def upload_chunks(collection_name: str, chunks: List[ChunkItem]) -> int:
        """Embed text chunks and upsert them into the specified collection.

        Args:
            collection_name: Target collection name.
            chunks: List of ChunkItem objects (text + metadata).

        Returns:
            Number of points upserted.

        Raises:
            HTTPException: 404 if collection does not exist.
            HTTPException: 500 if embedding generation fails.
        """
        VectorStoreManager._raise_if_missing(collection_name)

        if not chunks:
            logger.warning("upload_chunks called with empty chunk list — no-op.")
            return 0

        texts = [c.text for c in chunks]

        try:
            response = embedding_client.embeddings.create(input=texts, model=EMBEDDING_MODEL)
            embeddings = [data.embedding for data in response.data]
        except Exception as e:
            logger.error("Embedding generation failed: %s", e)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate embeddings: {e}",
            )

        points = []
        for i, chunk in enumerate(chunks):
            points.append(
                qdrant_models.PointStruct(
                    id=str(uuid.uuid4()),
                    vector=embeddings[i],
                    payload=build_payload(chunk.text, chunk.metadata),
                )
            )

        qdrant_client.upsert(collection_name=collection_name, wait=True, points=points)
        logger.info("Uploaded %d chunks to '%s'", len(points), collection_name)
        return len(points)

    @staticmethod
    def search(collection_name: str, query_text: str, top_k: int = 10) -> SearchResponse:
        """Perform vector similarity search on a collection.

        Embeds the query text, searches Qdrant for the nearest neighbours,
        and returns scored results.

        Args:
            collection_name: Collection to search.
            query_text: Natural language query.
            top_k: Maximum number of results (1–100).

        Returns:
            SearchResponse with scored result items.

        Raises:
            HTTPException: 404 if collection does not exist.
            HTTPException: 500 if query embedding fails.
        """
        VectorStoreManager._raise_if_missing(collection_name)

        try:
            resp = embedding_client.embeddings.create(input=[query_text], model=EMBEDDING_MODEL)
            query_vector = resp.data[0].embedding
        except Exception as e:
            logger.error("Query embedding failed: %s", e)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to embed query: {e}",
            )

        search_results = qdrant_client.query_points(
            collection_name=collection_name,
            query=query_vector,
            limit=top_k,
        ).points

        results = []
        for point in search_results:
            payload = point.payload or {}
            results.append(
                SearchResultItem(
                    content=payload.pop("text", ""),
                    score=point.score if point.score is not None else 0.0,
                    metadata=dict(payload),
                )
            )

        return SearchResponse(results=results)
