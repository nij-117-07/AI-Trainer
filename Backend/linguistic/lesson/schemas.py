from typing import List, Literal, Optional

from pydantic import BaseModel, Field

CEFR_LEVEL = Literal["A1", "A2", "B1", "B2", "C1", "C2"]
LEARNING_FOCUS = Literal["Grammar", "Vocabulary", "Conversation", "Culture", "Pronunciation"]
COMPLEXITY_WEIGHT = Literal["Low", "Medium", "High"]


class LessonRequest(BaseModel):
    """Request model for generating a scaffolded language lesson."""

    native_language: str = Field(..., example="English", description="The user's primary language")
    target_language: str = Field(..., example="Japanese", description="The language the user is learning")
    current_level: CEFR_LEVEL = Field(..., description="CEFR proficiency level")
    last_lesson_summary: Optional[str] = Field(None, description="Brief recap of previous concepts")
    learning_focus: LEARNING_FOCUS = Field(..., description="The pedagogical focus of the lesson")
    complexity_weight: COMPLEXITY_WEIGHT = Field(..., description="Determines depth and number of exercises")
    seed: str = Field(..., description="Random string to ensure variety")
    user_custom_instruction: Optional[str] = Field(None, description="Thematic constraints like 'Cyberpunk setting'")


class VocabularyItem(BaseModel):
    """A single vocabulary item from the lesson."""

    word: str = Field(..., description="The word in the target language")
    ipa: str = Field(..., description="International Phonetic Alphabet transcription")
    translation: str = Field(..., description="Translation in the native language")
    example: str = Field(..., description="A thematic example sentence")


class LessonResponse(BaseModel):
    """Response model containing the scaffolded language lesson."""

    header: str = Field(..., description="A creative title combining the target language and theme")
    comparative_analysis: str = Field(..., description="How the concept differs from the user's native language")
    deep_dive: str = Field(..., description="The core lesson content")
    vocabulary: List[VocabularyItem] = Field(..., description="The thematic vocabulary list")
    practice: List[str] = Field(..., description="Tiered exercises (Recognition, Transformation, Creative)")
    nuance: str = Field(..., description="An 'Insider Tip' about native usage")
    homework: str = Field(..., description="A real-world challenge for the user")
