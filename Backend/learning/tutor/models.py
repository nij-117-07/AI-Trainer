import datetime
from typing import Optional

from pydantic import BaseModel, Field


class PromptFile(BaseModel):
    """
    ORM-style model representing a persisted prompt template.

    Stored as a YAML document under the tutor prompts directory.
    """

    name: str = Field(..., description="Unique identifier for the prompt")
    content: str = Field(..., description="The system prompt text")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
