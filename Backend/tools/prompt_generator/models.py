import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class PersonaRecord(BaseModel):
    """
    ORM-style model representing a generated LLM persona.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique persona generation identifier")
    scenario: str = Field(..., description="The use-case or domain")
    context: Optional[str] = Field(None, description="Background information or constraints")
    user_instructions: Optional[str] = Field(None, description="Stylistic preferences or rules")
    reference_samples: List[str] = Field(default_factory=list, description="Example prompts to emulate")
    past_prompt: str = Field("", description="Previous persona version iterated upon")
    persona_name: str = Field("", description="Generated persona name")
    generated_persona_system_prompt: str = Field("", description="The generated system prompt")
    seed_used: str = Field("", description="The seed used for reproducibility")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
