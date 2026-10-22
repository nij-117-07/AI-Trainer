from typing import List, Literal, Optional

from pydantic import BaseModel, Field

PROFICIENCY = Literal["basic", "academic", "poetic", "slang"]


class WOTDRequest(BaseModel):
    """Request model for the Word of the Day generator."""

    target_language: str = Field(..., example="Japanese", description="The language of the Word of the Day")
    native_language: str = Field(default="English", example="English", description="User's primary language for explanations")
    proficiency: PROFICIENCY = Field(default="academic", description="Linguistic register of the explanation")
    theme: Optional[str] = Field(default="General", description="Theme like 'Nature' or 'Technology'")
    custom_instructions: Optional[str] = Field(None, description="Extra rules such as 'Untranslatable words only'")


class WOTDResponse(BaseModel):
    """Response model containing the linguistic deep-dive for the day's word."""

    word: str = Field(..., description="The chosen word")
    native_translation: str = Field(..., description="Closest equivalent in the user's native language")
    phonetic_and_audio_guide: str = Field(..., description="Pronunciation guide")
    morphology_breakdown: str = Field(..., description="Etymological roots (Latin, Greek, etc.)")
    primary_definition: str = Field(..., description="Dictionary-style meaning in the native language")
    the_vibe_check: str = Field(..., description="The 'feeling' and social context of the word")
    historical_evolution: str = Field(..., description="How the meaning has shifted over the centuries")
    modern_usage_sentence: str = Field(..., description="Example sentence with native translation")
    synonym_web: List[str] = Field(..., description="3-5 related words or concepts")
