import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class MemoryHookRecord(BaseModel):
    """Persistence contract for a single memory hook."""

    concept: str = Field(..., description="The specific piece of info.")
    hook: str = Field(..., description="The mnemonic or mental image.")


class MemorySession(BaseModel):
    """
    ORM-style model representing a generated mnemonic session.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique memory session identifier")
    topic: str = Field(..., description="The facts or data the user wanted to memorize")
    technique: Optional[str] = Field(None, description="The mnemonic technique used")
    explanation: str = Field("", description="Why the technique works for this data")
    memory_hooks: List[MemoryHookRecord] = Field(default_factory=list, description="The concept-to-hook mappings")
    retention_plan: str = Field("", description="The review plan to retain the information")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
