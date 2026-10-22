import datetime
from typing import Optional

from pydantic import BaseModel, Field


class VisionConversionRecord(BaseModel):
    """
    ORM-style model representing a vision conversion record.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for the client's session/memory app.
    """

    id: Optional[str] = Field(None, description="Unique record identifier")
    filename: str = Field("", description="Original uploaded filename")
    file_path: str = Field("", description="Stored image location")
    instruction: str = Field("", description="What was requested to be extracted")
    markdown_output: str = Field("", description="The converted Markdown string")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
