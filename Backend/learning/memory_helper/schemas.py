from typing import List, Optional

from pydantic import BaseModel, Field


class MemoryRequest(BaseModel):
    """Request model for generating memory hooks."""

    topic: str = Field(..., min_length=5, example="Photosynthesis", description="The facts or data to memorize.")
    technique: Optional[str] = Field(default="Best Fit", example="Method of Loci", description="Preferred mnemonic technique.")


class MemoryHook(BaseModel):
    """A single concept-to-hook mnemonic mapping."""

    concept: str = Field(..., description="The specific piece of info.")
    hook: str = Field(..., description="The mnemonic or mental image.")


class MemoryResponse(BaseModel):
    """Structured output containing the mnemonic aid and retention plan."""

    explanation: str = Field(..., description="Why the chosen technique works for this data.")
    memory_hooks: List[MemoryHook] = Field(default_factory=list, description="The concept-to-hook mnemonic mappings.")
    retention_plan: str = Field(..., description="A simple review plan to retain the information.")
