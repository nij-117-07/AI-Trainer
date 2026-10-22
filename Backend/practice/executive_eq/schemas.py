from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field

LearningFocus = Literal["diplomatic_refusal", "assertive_silence", "implied_authority", "strategic_ambiguity"]
DifficultyLevel = Literal["Rising Star", "Seasoned Exec", "Ruthless Board", "Crisis Mode"]
StatusImpact = Literal["Increased", "Maintained", "Diminished", "Completely Lost"]
StrategicGrade = Literal["A", "B", "C", "D", "F"]


class ChatMessage(BaseModel):
    """A single dialogue turn in the meeting history."""

    role: str = Field(..., description="Speaker role (e.g., 'user', 'npc')")
    content: str = Field(..., description="What was said")


class ScenarioRequest(BaseModel):
    """Request model for generating the high-stakes simulation context."""

    user_role: str = Field(..., description="The professional role the user is playing (e.g., 'VP of Sales', 'CEO')")
    narrative_arc: str = Field(..., description="The overarching strategic goal (e.g., 'Deflecting a hostile takeover')")
    learning_focus: LearningFocus = Field(..., description="The core EQ skill to be tested")
    difficulty_level: DifficultyLevel = Field(..., description="The intensity and hostility level of the simulation")
    industry_context: Optional[str] = Field(None, description="Specific industry (e.g., 'Biotech', 'FinTech'). Defaults to general corporate")


class ScenarioResponse(BaseModel):
    """Response model containing the simulation's foundation."""

    scenario_title: str = Field(..., description="A dramatic, classified-style name for the simulation")
    setting_description: str = Field(..., description="Vivid description of the physical environment and atmospheric tension")
    npc_profile: Dict[str, str] = Field(..., description="Structured profile of the primary counterpart")
    initial_stakes: str = Field(..., description="The concrete consequences of failure in this scenario")
    opening_hook: str = Field(..., description="The exact inciting incident or first line of dialogue")
    status: str = "success"


class TurnRequest(BaseModel):
    """Request model for the next NPC interaction in the training loop."""

    previous_scenario: Optional[str] = Field(None, description="The context of the last lesson or meeting (e.g., the scenario title)")
    narrative_arc: str = Field(..., description="The overall goal (e.g., 'Gaining leverage in a merger', 'Deflecting blame')")
    chat_history: List[ChatMessage] = Field(default_factory=list, description="The record of the dialogue so far")
    learning_focus: LearningFocus = Field(..., description="The specific EQ skill being practiced in this turn")
    seed: str = Field(..., description="A seed to vary the political tension and personality of the NPCs (usually the NPC's hidden motive)")
    user_customization: Optional[str] = Field(None, description="Optional user constraints, e.g., 'Make my boss extremely aggressive'")


class TurnResponse(BaseModel):
    """Response model containing the NPC's move and coaching advice."""

    rationale: str = Field(..., description="The psychological breakdown of why this move is being made by the NPC")
    meeting_scenario: str = Field(..., description="Vivid description of the setting, the 'vibe', and the NPC's non-verbal cues")
    npc_dialogue: str = Field(..., description="What the high-profile counterparty actually says to the user")
    eq_coach_message: str = Field(..., description="Advice on how to read the subtext and what to 'signal' in the next response")
    suggested_strategies: List[str] = Field(..., description="3 ways to reply: Direct, Subtle Pivot, Power Move")
    status: str = "success"


class EvaluateRequest(BaseModel):
    """Request model for grading the user's response in the high-stakes meeting."""

    scenario_context: str = Field(..., description="The immediate situation/setting the user responded to")
    npc_last_statement: str = Field(..., description="What the high-profile NPC said or did")
    user_response: str = Field(..., description="The actual words or actions the user just took")
    learning_focus: str = Field(..., description="The skill being practiced (e.g., 'Strategic Ambiguity')")


class EvaluateResponse(BaseModel):
    """Response model containing the behavioral analysis of the user's move."""

    subtext_accuracy: str = Field(..., description="Did the user correctly 'read' the NPC's hidden intent?")
    status_impact: StatusImpact = Field(..., description="How the user's social/professional status changed")
    strategic_grade: StrategicGrade = Field(..., description="How well the response aligns with the meeting's long-term goal")
    strengths: List[str] = Field(..., description="What the user did well in this specific turn")
    critical_flaws: List[str] = Field(..., description="Technical or EQ mistakes (e.g., 'Too defensive', 'Gave away too much info')")
    the_rewritten_pro_move: str = Field(..., description="How a Master Negotiator would have said the same thing for a better result")
    coaching_tip: str = Field(..., description="A psychological tip for the next turn")
    status: str = "success"
