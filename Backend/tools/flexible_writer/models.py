import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class FlexibleWriterRecord(BaseModel):
    """
    ORM-style model representing a flexible writer transformation record.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for the client's session/memory app.
    """

    id: Optional[str] = Field(None, description="Unique record identifier")
    system_prompt: str = Field("", description="The persona and rules used")
    input_data: Any = Field(None, description="The original input data")
    updated_data: Any = Field(None, description="The transformed result")
    answer_message: str = Field("", description="The conversational summary")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
