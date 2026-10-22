import logging
from fastapi import APIRouter, HTTPException, status

from vector_store.schemas import (
    ChunkItem,
    CollectionListResponse,
    CollectionResponse,
    CreateCollectionRequest,
    DeleteResponse,
    SearchRequest,
    SearchResponse,
    UploadChunksRequest,
)
from vector_store.services import VectorStoreManager

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/vector-store",
    tags=["Vector Store"],
)


@router.post(
    "/collections",
    response_model=CollectionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new collection",
)
async def create_collection(request: CreateCollectionRequest):
    """Create a new Qdrant vector collection.

    Args:
        request: Collection name, vector dimension, and distance metric.

    Returns:
        CollectionResponse with collection metadata.

    Raises:
        HTTPException 409: If the collection already exists.
    """
    return VectorStoreManager.create_collection(
        name=request.name,
        vector_dim=request.vector_dim,
        distance=request.distance,
    )


@router.get(
    "/collections",
    response_model=CollectionListResponse,
    summary="List all collections",
)
async def list_collections():
    """Retrieve metadata for every existing Qdrant collection.

    Returns:
        CollectionListResponse containing all collections.
    """
    return VectorStoreManager.list_collections()


@router.get(
    "/collections/{name}",
    response_model=CollectionResponse,
    summary="Get a single collection's details",
)
async def get_collection(name: str):
    """Get detailed metadata for a specific collection by name.

    Args:
        name: Collection name.

    Returns:
        CollectionResponse with collection details.

    Raises:
        HTTPException 404: If the collection does not exist.
    """
    return VectorStoreManager.get_collection(name)


@router.delete(
    "/collections/{name}",
    response_model=DeleteResponse,
    summary="Delete a collection",
)
async def delete_collection(name: str):
    """Delete a collection and all its stored vectors.

    Args:
        name: Collection name to delete.

    Returns:
        DeleteResponse confirming the deletion.

    Raises:
        HTTPException 404: If the collection does not exist.
    """
    VectorStoreManager.delete_collection(name)
    return DeleteResponse(
        status="success",
        message=f"Collection '{name}' has been deleted.",
    )


@router.post(
    "/collections/{name}/chunks",
    status_code=status.HTTP_200_OK,
    summary="Upload and embed chunks into a collection",
)
async def upload_chunks(name: str, payload: UploadChunksRequest):
    """Embed text chunks and store them in the specified collection.

    The endpoint accepts a list of text chunks with optional metadata,
    generates embeddings using the configured embedding model, and
    upserts them as points into the Qdrant collection.

    Args:
        name: Target collection name.
        payload: UploadChunksRequest containing chunks.

    Returns:
        Dict with 'collection', 'chunks_uploaded' count.

    Raises:
        HTTPException 404: If the collection does not exist.
        HTTPException 500: If embedding generation fails.
    """
    count = VectorStoreManager.upload_chunks(name, payload.chunks)
    return {
        "collection": name,
        "chunks_uploaded": count,
    }


@router.post(
    "/collections/{name}/search",
    response_model=SearchResponse,
    summary="Search within a collection",
)
async def search_collection(name: str, request: SearchRequest):
    """Perform vector similarity search on a collection.

    Embeds the query text and retrieves the nearest neighbour vectors
    from the collection, returning scored text results with metadata.

    Args:
        name: Collection to search in (from path).
        request: Query text and optional top_k.

    Returns:
        SearchResponse with scored results.

    Raises:
        HTTPException 404: If the collection does not exist.
        HTTPException 500: If query embedding fails.
    """
    return VectorStoreManager.search(
        collection_name=name,
        query_text=request.query,
        top_k=request.top_k,
    )
