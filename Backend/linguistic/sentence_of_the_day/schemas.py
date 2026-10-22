from typing import List, Literal

from pydantic import BaseModel, Field

CONTEXT_SETTING = Literal["business", "casual", "literary", "romantic", "travel"]
COMPLEXITY_LEVEL = Literal["beginner", "intermediate", "advanced", "native-level"]


class SentenceRequest(BaseModel):
    """Request model for the Sentence of the Day generator."""

    target_language: str = Field(..., example="Spanish", description="The language the user is learning")
    native_language: str = Field(..., example="English", description="The user's primary language")
    context_setting: CONTEXT_SETTING = Field(..., description="The situational setting of the sentence")
    complexity_level: COMPLEXITY_LEVEL = Field(..., description="The proficiency level of the sentence")


class SentenceResponse(BaseModel):
    """Response model containing the daily featured sentence and its nuances."""

    date: str = Field(..., description="The date the sentence was generated (YYYY-MM-DD)")
    target_sentence: str = Field(..., description="The sentence in the target language")
    literal_translation: str = Field(..., description="Word-for-word translation in the native language")
    natural_translation: str = Field(..., description="Meaning-based translation in the native language")
    grammatical_highlight: str = Field(..., description="Explanation of a rule or tense used in the sentence")
    cultural_context: str = Field(..., description="Where, why, and how a native would use this sentence")
    substitution_options: List[str] = Field(..., description="2-3 variations changing one key word")
