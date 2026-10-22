import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class RewriteRecord(BaseModel):
    """
    ORM-style model representing a text rewrite request.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique rewrite identifier")
    target_tone: str = Field(..., description="Desired tone of the rewrite")
    audience: str = Field(..., description="The target demographic")
    transformation_goal: str = Field(..., description="The primary objective of the rewrite")
    original_text: str = Field("", description="The source text")
    rewritten_text: str = Field("", description="The final polished text")
    improvements_made: List[str] = Field(default_factory=list, description="Specific changes applied")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
