from typing import Any, Dict, List
from pydantic import BaseModel, Field


class CreateCollectionRequest(BaseModel):
    """Request model for creating a new Qdrant collection."""

    name: str = Field(..., description="Unique collection name")
    vector_dim: int = Field(default=768, description="Dimensionality of the embedding vectors")
    distance: str = Field(default="Cosine", description="Distance metric (Cosine, Euclid, Dot)")


class CollectionResponse(BaseModel):
    """Response model for a single collection's metadata."""

    name: str
    vector_size: int
    distance: str
    points_count: int


class CollectionListResponse(BaseModel):
    """Response model for listing all collections."""

    collections: List[CollectionResponse]


class ChunkItem(BaseModel):
    """A single text chunk with optional metadata."""

    text: str = Field(..., description="Chunk text content")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Arbitrary metadata for the chunk")


class UploadChunksRequest(BaseModel):
    """Request model for uploading chunks to a collection."""

    chunks: List[ChunkItem] = Field(..., description="List of text chunks to embed and store")


class SearchRequest(BaseModel):
    """Request model for searching within a collection."""

    query: str = Field(..., description="Search query text")
    top_k: int = Field(default=10, ge=1, le=100, description="Number of results to return")


class SearchResultItem(BaseModel):
    """A single search result with content, score, and metadata."""

    content: str
    score: float
    metadata: Dict[str, Any]


class SearchResponse(BaseModel):
    """Response model for search results."""

    results: List[SearchResultItem]


class DeleteResponse(BaseModel):
    """Response model for a delete operation."""

    status: str
    message: str
