from typing import List, Optional

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """A single turn in the roleplay conversation."""

    role: str = Field(..., description="The speaker: user or assistant.")
    content: str = Field(..., description="The message body.")


class RoleplayChatRequest(BaseModel):
    """Request model for a roleplay chatbot turn."""

    system_prompt: str = Field(
        ...,
        description=(
            "The character's full persona definition — personality, backstory, "
            "speech style, rules, and behavioral constraints."
        ),
    )
    history: List[ChatMessage] = Field(
        default_factory=list,
        description="Previous conversation turns to maintain continuity.",
    )
    user_input: str = Field(
        ...,
        description="The most recent message from the user that the character must respond to.",
    )
    character_name: str = Field(
        default="Character",
        description="Display name of the character (used when formatting history).",
    )
    temperature: float = Field(
        default=0.8,
        ge=0.0,
        le=2.0,
        description="Sampling temperature — higher values produce more expressive output.",
    )


class RoleplayChatResponse(BaseModel):
    """Response model containing the character's reply."""

    response: str = Field(..., description="The in-character reply to the user's latest message.")
    emotion: str = Field(default="", description="Emotional tag describing the character's current state.")
    action: str = Field(default="", description="Physical action or stage direction wrapped in asterisks.")
    status: str = "success"
