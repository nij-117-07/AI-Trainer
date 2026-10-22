import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class SocialPostRecord(BaseModel):
    """
    ORM-style model representing a social media post generation run.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique generation identifier")
    platform: str = Field(..., description="Target platform (e.g., LinkedIn, X, Instagram)")
    user_query: str = Field(..., description="The core topic or goal for the post")
    chat_history: Optional[str] = Field(None, description="Past interactions for context")
    liked_post_examples: Optional[str] = Field(None, description="Style reference posts")
    num_suggestions: int = Field(3, description="Number of variants requested")
    user_message: str = Field("", description="Strategy explanation message")
    post_suggestions: List[dict] = Field(default_factory=list, description="The generated post variants")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
