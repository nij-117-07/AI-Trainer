import datetime
from typing import Optional

from pydantic import BaseModel, Field


class DiagramRecord(BaseModel):
    """
    ORM-style model representing a generated diagram.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique diagram generation identifier")
    format: str = Field("", description="Diagram format: 'mermaid' or 'drawio'")
    instruction: str = Field("", description="The user's diagram instruction")
    context: str = Field("", description="Technical or business context provided")
    existing_code: Optional[str] = Field(None, description="Prior diagram code that was modified")
    answer_message: str = Field("", description="Explanation of what was added or changed")
    diagram_code: str = Field("", description="The generated diagram code (Mermaid or Draw.io XML)")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
