from typing import List, Literal, Optional

from pydantic import BaseModel, Field

ROADMAP_MODES = Literal["detailed", "short"]


class RoadmapRequest(BaseModel):
    """Request model for generating a full learning roadmap."""

    subject: str = Field(..., example="UI/UX Design", description="The learning topic")
    start_level: str = Field(..., example="Beginner", description="Current proficiency")
    target_level: str = Field(..., example="Professional", description="Desired proficiency")
    mode: ROADMAP_MODES = Field(default="detailed", description="How comprehensive the roadmap should be")
    persona_style: Optional[str] = Field(
        default="industry expert",
        example="academic",
        description="Style requirements for the expert persona",
    )
    user_instructions: Optional[str] = Field(
        None,
        example="Add more focus on Figma prototyping",
        description="Refinement instructions for the roadmap",
    )


class RoadmapResponse(BaseModel):
    """Response model containing the generated persona and main topics."""

    generated_persona_prompt: str = Field(..., description="The AI expert persona system prompt")
    main_topics: List[str] = Field(..., description="The high-level chapters of the roadmap")
    status: str = "success"


class SubtopicRequest(BaseModel):
    """Request model for expanding a single module into subtopics."""

    persona: str = Field(..., description="The generated persona prompt from Step 1")
    subject: str = Field(..., example="UI/UX Design")
    target_level: str = Field(..., example="Professional")
    full_topic_list: List[str] = Field(..., description="The full list of main topics")
    current_module: str = Field(..., description="The specific topic to expand")
    mode: ROADMAP_MODES = Field(default="detailed")


class SubtopicResponse(BaseModel):
    """Response model containing the deep-dive subtopics and milestone."""

    topic: str = Field(..., description="The expanded module")
    subtopics: List[str] = Field(..., description="Specific concepts, tasks, or lessons")
    milestone: str = Field(..., description="A project or test confirming mastery")
    status: str = "success"
