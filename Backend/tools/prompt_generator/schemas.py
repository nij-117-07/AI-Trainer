from typing import List, Optional

from pydantic import BaseModel, Field


class PersonaCreate(BaseModel):
    """Request model for LLM persona generation."""

    scenario: str = Field(
        ...,
        description="The specific use-case or domain (e.g., 'Financial Advisor')",
    )
    context: Optional[str] = Field(
        None,
        description="Background information, target audience, or environment constraints.",
    )
    user_instructions: Optional[str] = Field(
        None,
        description="Specific 'dos and don'ts', stylistic preferences, or personality traits.",
    )
    reference_samples: Optional[List[str]] = Field(
        None,
        description="Examples of existing prompts or writing styles to emulate.",
    )
    past_prompt: Optional[str] = Field(
        "",
        description="A previous version of the persona to iterate upon or improve.",
    )
    seed: Optional[str] = Field(
        None,
        description="Optional: provide a specific seed, otherwise one is generated randomly.",
    )


class PersonaResponse(BaseModel):
    """Response model containing the generated persona."""

    persona_name: str = Field(..., description="Professional name for the persona.")
    generated_persona_system_prompt: str = Field(..., description="The complete system prompt.")
    seed_used: str = Field(..., description="The seed used, useful to replicate the result later.")
