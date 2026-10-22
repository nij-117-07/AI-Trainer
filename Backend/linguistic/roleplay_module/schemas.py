from typing import List, Optional

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """A single message in the roleplay conversation."""

    role: str = Field(..., description="The speaker role (e.g., 'User', 'Assistant')")
    content: str = Field(..., description="The message content")


class RoleplayRequest(BaseModel):
    """Request model for a roleplay chat turn."""

    system_prompt: str = Field(..., description="The core persona traits")
    history: List[ChatMessage] = Field(default_factory=list, description="Previous messages of the conversation")
    message: str = Field(..., description="The latest message from the user")
    language: str = Field(default="English", description="The language the chatbot must communicate in")
    seed: str = Field(..., description="A unique identifier for the session to maintain consistency")
    additional_instructions: Optional[str] = Field(default="Be creative.", description="Specific constraints for this turn")


class RoleplayResponse(BaseModel):
    """Response model containing the AI's roleplay message."""

    response_message: str = Field(..., description="The AI's in-character response")
    status: str = Field(default="success", description="Operation status")


class RoleplayRecord(BaseModel):
    """A persisted roleplay persona."""

    name: str = Field(..., description="Unique ID/Name of the persona")
    prompt: str = Field(..., description="The system prompt/personality")


class RoleplayUpdate(BaseModel):
    """Request model for updating a roleplay persona's prompt."""

    prompt: str = Field(..., description="The new system prompt/personality")
