from typing import List, Optional

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """A single turn in the tutoring conversation."""

    role: str = Field(..., description="The speaker: user, assistant, or system.")
    content: str = Field(..., description="The message body.")


class ConceptItem(BaseModel):
    """A single concept from the educational breakdown."""

    title: str = Field(..., description="The name of the concept or sub-topic.")
    description: str = Field(..., description="A clear, educational explanation or detail.")


class TutorChatRequest(BaseModel):
    """Request model for a topic-scoped tutor chat turn."""

    master_topic: str = Field(..., description="The main subject the user wants to learn.")
    additional_context: Optional[str] = Field(
        None,
        description="User's background, goals, or learning style constraints.",
    )
    chat_history: List[ChatMessage] = Field(
        default_factory=list,
        description="Previous conversation turns to maintain continuity.",
    )
    user_input: str = Field(..., description="The current question or message from the student.")


class TutorChatResponse(BaseModel):
    """Response model containing the tutor's reply and breakdown."""

    tutor_response: str = Field(..., description="A supportive, conversational response to the student.")
    educational_breakdown: List[ConceptItem] = Field(
        ...,
        description="A structured list of concepts related to the current turn.",
    )
    status: str = "success"
