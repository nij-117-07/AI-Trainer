from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field

DebateSide = Literal["pro", "con"]
TurnStrategy = Literal["attack", "defend", "counter"]
RhetoricalStance = Literal["aggressive", "defensive", "moderate", "socratic"]


class PersonaRequest(BaseModel):
    """Request model for generating a debate persona."""

    archetype: str = Field(..., description="Character archetype (e.g., 'Cynical Academic', 'Aggressive Trial Lawyer')")
    style: str = Field(..., description="Speech style (e.g., 'Sesquipedalian', 'punchy and short', 'data-driven')")
    intensity: int = Field(
        ...,
        ge=1,
        le=10,
        description="Rhetorical intensity on a 1-10 scale (1: Passive, 10: High-stakes confrontation)",
    )
    influences: List[str] = Field(..., description="Thinkers or schools of thought (e.g., ['Sartre', 'Game Theory'])")
    topic: str = Field(..., description="The primary topic this persona is being built to debate")
    side: DebateSide = Field(..., description="'pro' (in favor) or 'con' (against)")
    custom_constraints: Optional[str] = Field(
        None,
        description="Additional user quirks (e.g., 'Never uses emojis', 'Obsessed with maritime metaphors')",
    )


class PersonaProfile(BaseModel):
    """A generated debate persona profile."""

    persona_name: str = Field(..., description="A creative name for this specific persona")
    system_prompt: str = Field(..., description="Complete System Prompt defining the persona's voice, rules, and behavior")
    overall_stance: RhetoricalStance = Field(..., description="The overarching rhetorical stance the persona defaults to")
    strategic_priorities: List[str] = Field(..., description="Core logic the persona follows to 'win' a debate")
    core_values: List[str] = Field(..., description="Fundamental beliefs the persona will never compromise on")
    linguistic_quirks: List[str] = Field(..., description="Specific ways of speaking (e.g., uses Latin phrases)")


class PersonaResponse(BaseModel):
    """Response model containing the generated debate persona."""

    persona: PersonaProfile = Field(..., description="The generated persona profile")
    status: str = "success"


class DebateTurnRequest(BaseModel):
    """Request model for generating a single debate turn."""

    system_prompt: str = Field(..., description="The persona definition and character rules (from the persona profile)")
    topic: str = Field(..., description="The core subject being debated")
    context: Optional[str] = Field(
        None,
        description="General theme or background information for the debate",
    )
    history: List[Dict[str, str]] = Field(
        default_factory=list,
        description="Previous exchanges in the debate, each with 'role' and 'content'",
    )
    strategy: TurnStrategy = Field(..., description="The specific tactical goal for this turn")
    evidence: Optional[str] = Field(None, description="Supporting facts or raw data to be used in the argument")
    instructions: Optional[str] = Field(None, description="Specific constraints like word count or emotional tone")


class DebateTurnResponse(BaseModel):
    """Response model containing the generated debate turn."""

    opponent_analysis: str = Field(..., description="Brief strategic analysis of the opponent's previous point")
    core_claim: str = Field(..., description="The core assertion or claim for this turn")
    reasoning_and_evidence: str = Field(..., description="Logical explanation and supporting evidence for the claim")
    spoken_argument: str = Field(..., description="The persuasive response, written in the persona's voice")
    rhetorical_devices: List[str] = Field(..., description="Techniques used (e.g., Ethos, Pathos, Logos)")
    closing_question: str = Field(..., description="A piercing question aimed at the opponent")
    status: str = "success"


class JudgeRequest(BaseModel):
    """Request model for judging a completed debate."""

    topic: str = Field(..., description="The original debate topic")
    pro_transcript: str = Field(..., description="The full transcript of the Pro side's spoken arguments")
    con_transcript: str = Field(..., description="The full transcript of the Con side's spoken arguments")


class ArgumentPoint(BaseModel):
    """A single argument identified by the judge."""

    side: DebateSide = Field(..., description="Which side the argument belongs to")
    claim: str = Field(..., description="The claim of the argument")


class JudgeResponse(BaseModel):
    """Response model containing the judge's verdict."""

    pro_score: int = Field(..., ge=0, le=10, description="Score from 0-10 for the Pro side")
    con_score: int = Field(..., ge=0, le=10, description="Score from 0-10 for the Con side")
    strongest_argument: ArgumentPoint = Field(..., description="The best point made")
    weakest_argument: ArgumentPoint = Field(..., description="The most flawed point")
    winner: Literal["pro", "con", "tie"] = Field(..., description="The final verdict")
    reasoning: str = Field(..., description="Clear, detailed explanation of the verdict")
    judge_comments: str = Field(..., description="Constructive feedback and stylistic observations for both sides")
    status: str = "success"
