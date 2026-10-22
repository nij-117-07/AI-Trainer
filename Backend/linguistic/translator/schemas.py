from typing import Literal, Optional

from pydantic import BaseModel, Field

TONE = Literal["formal", "casual", "business", "poetic", "technical"]


class TranslationRequest(BaseModel):
    """Request model for contextual translation."""

    text_to_translate: str = Field(..., description="The source text that needs translation")
    source_language: str = Field(..., example="English", description="The language of the input text")
    target_language: str = Field(..., example="Japanese", description="The language the text should be translated into")
    tone: TONE = Field(..., description="The desired style of the translation")
    reference_material: Optional[str] = Field(None, description="Glossary or context snippets to maintain consistency")
    custom_instructions: Optional[str] = Field(None, description="Specific rules (e.g., 'avoid gendered pronouns')")


class TranslationResponse(BaseModel):
    """Response model containing the translation and its linguistic rationale."""

    rationale: str = Field(..., description="Brief explanation of linguistic choices made for this translation")
    translated_text: str = Field(..., description="The final translated content")
    cultural_notes: Optional[str] = Field(None, description="Notes on idioms or cultural adjustments made during translation")
