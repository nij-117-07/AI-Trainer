from typing import Literal, Optional

from pydantic import BaseModel, Field

PROFICIENCY = Literal["beginner", "intermediate", "advanced", "native-aspirant"]


class IdiomRequest(BaseModel):
    """Request model for generating an idiomatic expression lesson."""

    target_language: str = Field(..., example="French", description="The language the user wants to learn")
    user_proficiency: PROFICIENCY = Field(..., description="Current level of the user")
    theme_or_keyword: str = Field(..., example="Success and Hard Work", description="The general topic of the idiom")
    native_language: str = Field(..., example="English", description="The user's primary language for explanations")
    seed: str = Field(..., description="Unique string for rotation logic")
    custom_user_request: Optional[str] = Field(None, description="Specific user preferences like 'make it funny'")


class IdiomResponse(BaseModel):
    """Response model containing the idiomatic expression lesson."""

    rationale: str = Field(..., description="Reasoning for selecting this specific idiom")
    idiom_in_target_language: str = Field(..., description="The idiom written in the target language")
    phonetic_pronunciation: str = Field(..., description="How to say it (IPA or phonetic spelling)")
    figurative_meaning: str = Field(..., description="The actual meaning interpreted in the native language")
    cultural_context: str = Field(..., description="The historical origin or social setting")
    equivalent_in_native_language: str = Field(..., description="A matching idiom in the user's native tongue")
    dialogue_scenario: str = Field(..., description="A short script showing the idiom in use")
    practice_prompt: str = Field(..., description="A question asking the user to use the idiom in a new sentence")
