from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """A single turn in a tutoring conversation."""

    role: str = Field(..., example="student", description="The speaker: user, assistant, or system.")
    content: str = Field(..., example="What is a for loop?", description="The message body.")


class TutorRequest(BaseModel):
    """Request model for generating an adaptive explanation."""

    system_prompt: str = Field(..., description="The persona and pedagogical rules.")
    user_query: str = Field(..., example="Why does water boil at 100C?", description="The student's specific question or struggle.")
    student_level: str = Field(..., example="High School", description="Level: Toddler, High School, Expert, etc.")
    learning_style: str = Field(..., example="analogical", description="Preferred framing: analogical, first_principles, etc.")
    current_scenario: str = Field(..., example="preparing for an exam", description="Context of learning.")
    chat_history: List[ChatMessage] = Field(default_factory=list, description="Previous conversation turns.")
    last_topic_taught: Optional[str] = Field(None, description="Context of the previous lesson.")


class TutorResponse(BaseModel):
    """Response model containing the adaptive teaching output."""

    adapted_explanation: str = Field(..., description="The teaching content, tailored to the user's level.")
    concept_analogy: Optional[str] = Field(None, description="A metaphor or 'mental hook' to aid recall.")
    tutor_feedback: str = Field(..., description="The conversational response and a nudge/question.")


class PromptCreateUpdate(BaseModel):
    """Request model for creating or updating a prompt template."""

    name: str = Field(..., example="socratic_tutor", description="Unique name for the prompt file.")
    content: str = Field(..., example="You are a Socratic tutor...", description="The system prompt text.")


class PromptResponse(BaseModel):
    """Response model for a single prompt template."""

    name: str = Field(..., description="The prompt identifier.")
    content: str = Field(..., description="The system prompt text.")
    created_at: Optional[datetime] = Field(None, description="Creation timestamp.")
    updated_at: Optional[datetime] = Field(None, description="Last-update timestamp.")


class PromptActionResponse(BaseModel):
    """Response model for prompt mutation endpoints."""

    message: str = Field(..., example="Prompt 'socratic_tutor' created/updated successfully", description="Human-readable result message.")
