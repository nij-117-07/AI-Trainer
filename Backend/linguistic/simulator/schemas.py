from typing import List, Optional

from pydantic import BaseModel, Field


class SimulationRequest(BaseModel):
    """Request model for a behavioral simulation run."""

    persona: str = Field(..., example="A pragmatic retired starship captain.", description="The persona to embody")
    scenario: str = Field(..., example="Oxygen levels at 15%. Distress signal detected.", description="The setting or situation")
    user_input: str = Field(..., example="Captain, we must help them!", description="The dialogue directed at the persona")
    additional_context: Optional[str] = Field(None, description="Extra background info, history, or environmental factors")


class SimulationResponse(BaseModel):
    """Response model containing the simulation results."""

    simulation_id: str = Field(..., description="Unique identifier for this run")
    thought_process: str = Field(..., description="The persona's chain of thought")
    chosen_action: str = Field(..., description="The physical or verbal action taken")
    response_dialogue: str = Field(..., description="The words spoken by the persona")
    emotional_state: str = Field(..., description="The persona's mood after the interaction")


class PromptCreate(BaseModel):
    """Request model for creating a system prompt."""

    name: str = Field(..., example="captain_crush", description="The prompt identifier")
    content: str = Field(..., example="You are a strict, no-nonsense starship captain.", description="The system prompt content")


class PromptUpdate(BaseModel):
    """Request model for updating a system prompt."""

    content: str = Field(..., description="The new system prompt content")


class PromptDetail(BaseModel):
    """Response model for a single stored system prompt."""

    name: str = Field(..., description="The prompt identifier")
    content: str = Field(..., description="The system prompt content")


class ChatMessage(BaseModel):
    """A single message in the situational chat."""

    role: str = Field(..., description="The speaker role (e.g., 'User', 'Assistant')")
    content: str = Field(..., description="The message content")


class ChatRequest(BaseModel):
    """Request model for a single situational chat turn."""

    persona: str = Field(..., description="The persona and personality traits")
    scenario: str = Field(..., description="The initial setting or ongoing situation")
    user_input: str = Field(..., description="The latest message or action from the user")
    chat_history: List[ChatMessage] = Field(default_factory=list, description="The formatted history of past interactions")


class ChatResponse(BaseModel):
    """Response model containing the AI character's turn."""

    thought: str = Field(..., description="The AI character's internal reasoning")
    dialogue: str = Field(..., description="The AI character's in-character response")
    updated_history: List[ChatMessage] = Field(..., description="The chat history including this turn")
