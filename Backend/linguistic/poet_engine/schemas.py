from typing import Literal, Optional

from pydantic import BaseModel, Field

POETIC_STYLE = Literal["Shayari/Couplet", "Haiku", "Metaphorical Prose", "Ghazal-style"]


class ConceptRequest(BaseModel):
    """Request model for explaining the 'Soul' of a word."""

    target_language: str = Field(..., example="Urdu", description="The source language of the concept")
    native_language: str = Field(..., example="English", description="The user's primary language for the explanation")
    concept_word: str = Field(..., example="Ishq", description="The specific word or abstract concept")
    poetic_style: POETIC_STYLE = Field(..., description="The poetic form used for the generation")
    user_mood: Optional[str] = Field(default="mystical", description="The emotional tone for the generation")
    user_custom_instruction: Optional[str] = Field(None, description="Specific constraints like nature metaphors or urban settings")


class ConceptResponse(BaseModel):
    """Response model containing the poetic explanation of the concept."""

    etymological_soul: str = Field(..., description="The cultural and historical origin of the word")
    original_poetry: str = Field(..., description="The poetic piece in the target language")
    soulful_translation: str = Field(..., description="A deep translation into the user's native language")
    philosophical_reflection: str = Field(..., description="Connection of the word to the universal human experience")
    visual_metaphor: str = Field(..., description="A vivid description of a scene representing this concept")
