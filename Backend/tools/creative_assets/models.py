import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class CreativeAssetRecord(BaseModel):
    """
    ORM-style model representing a creative asset generation run.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique generation identifier")
    task_type: str = Field(..., description="The type of asset to generate")
    user_query: str = Field(..., description="The primary topic, product description, or raw idea")
    context: Optional[str] = Field(None, description="Target audience, tone, or marketing goals")
    reference_examples: List[str] = Field(default_factory=list, description="Style reference examples")
    number_of_suggestions: int = Field(3, description="Number of variations requested")
    suggestions: List[dict] = Field(default_factory=list, description="The generated assets")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
