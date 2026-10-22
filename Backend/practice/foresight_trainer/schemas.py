from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field

ScenarioDifficulty = Literal["beginner", "intermediate", "advanced"]
RiskLevel = Literal["low", "medium", "high"]
TimeCost = Literal["fast", "moderate", "slow"]
SkillAssessment = Literal["developing", "competent", "proficient", "expert"]


class Scene(BaseModel):
    """An immersive narrative scene ending at a critical decision point."""

    scene_narrative: str = Field(..., description="The immersive scene description in second person")
    decision_point: str = Field(..., description="The critical decision the user must make")
    time_pressure: str = Field(..., description="Any time constraint or urgency")
    difficulty_adjustment: Optional[str] = Field(
        None,
        description="How and why difficulty changed (only present for subsequent scenes)",
    )


class ChoiceOption(BaseModel):
    """A single choice the user can make."""

    id: str = Field(..., description="Option letter (A, B, C, D)")
    title: str = Field(..., description="Short 3-5 word label for the option")
    description: str = Field(..., description="What this action involves (2-3 sentences)")
    approach_type: str = Field(..., description="The thinking style (e.g., 'analytical', 'diplomatic')")
    risk_level: RiskLevel = Field(..., description="Low, medium, or high risk")
    time_cost: TimeCost = Field(..., description="How fast this option is: fast, moderate, or slow")
    hidden_tradeoff: str = Field(..., description="What this option sacrifices (shown only after choice)")


class ScenarioBlueprint(BaseModel):
    """Structured scenario blueprint extracted from the user's context."""

    setting: str = Field(..., description="Where and when this takes place")
    protagonist: str = Field(..., description="Who the user is in this scenario (role, constraints, resources)")
    core_conflict: str = Field(..., description="The central tension or problem")
    stakes: str = Field(..., description="What happens if they succeed or fail")
    thinking_skill: str = Field(..., description="The specific cognitive skill being trained")
    tone: str = Field(..., description="The narrative tone (tense, reflective, fast-paced, etc.)")
    hidden_variables: List[str] = Field(..., description="2-3 underlying factors the user doesn't know about yet")


class StartRequest(BaseModel):
    """Request model for starting a new foresight scenario."""

    user_context: str = Field(..., description="Raw background context or scenario description from the user")
    main_theme: str = Field(..., description="The core theme or skill to train (e.g., 'strategic negotiation')")
    difficulty: ScenarioDifficulty = Field(
        "intermediate",
        description="Desired difficulty: beginner, intermediate, advanced",
    )
    max_scenes: int = Field(
        5,
        ge=1,
        le=20,
        description="Maximum number of scenes before the progress report",
    )


class StartResponse(BaseModel):
    """Response model containing the opening scene, options, and blueprint."""

    scene: Scene = Field(..., description="The opening scene and decision point")
    options: List[ChoiceOption] = Field(..., description="The available choices for this scene")
    custom_option_prompt: str = Field(..., description="Prompt to also write a custom option if none fit")
    blueprint: ScenarioBlueprint = Field(..., description="Full blueprint — persist this with the session")
    max_scenes: int = Field(..., description="Maximum scene count for this scenario")
    status: str = "success"


class DecisionEvaluation(BaseModel):
    """Evaluation of the user's decision and reasoning quality."""

    scores: Dict[str, int] = Field(..., description="Dimension scores 0-10: foresight, empathy, creativity, risk_awareness, reasoning_quality")
    overall_score: float = Field(..., ge=0.0, le=10.0, description="Weighted average score (0-10)")
    strengths: List[str] = Field(..., description="2-3 things done well in their thinking")
    blind_spots: List[str] = Field(..., description="2-3 things missed or not considered")
    thinking_pattern: str = Field(..., description="What style of thinker they're showing (e.g., 'cautious optimizer')")
    one_lesson: str = Field(..., description="A single powerful insight about their decision-making")


class Consequences(BaseModel):
    """Realistic ripple effects from the user's choice."""

    immediate_effects: List[str] = Field(..., description="2-3 things that happen right away")
    delayed_effects: List[str] = Field(..., description="1-2 things that emerge later")
    hidden_reveal: str = Field(..., description="Which hidden variable(s) get revealed and how")
    new_complication: str = Field(..., description="A new problem or twist that arises")
    relationship_impact: str = Field(..., description="How key characters/stakeholders are affected")
    resource_changes: str = Field(..., description="What resources were gained or lost")
    world_state_update: str = Field(..., description="Brief summary of how the world has changed")


class InsightReport(BaseModel):
    """Meta-cognitive coaching insight about the user's thinking pattern."""

    pattern_observation: str = Field(..., description="What thinking pattern is being noticed")
    cognitive_bias_alert: str = Field(..., description="Any bias detected, or 'none_detected'")
    strength_spotlight: str = Field(..., description="One specific thing done brilliantly")
    growth_edge: str = Field(..., description="One specific area to stretch into next time")
    real_world_parallel: str = Field(..., description="A real-world situation where this pattern matters")
    coaching_question: str = Field(..., description="A powerful question to sit with before the next scene")


class DecisionRecord(BaseModel):
    """A single recorded decision, used for progress tracking."""

    scene_number: int = Field(..., ge=1, description="Which scene the decision was made in")
    choice_made: str = Field(..., description="The option selected (A/B/C/D or custom)")
    approach_type: str = Field(..., description="The thinking style of the choice")
    scores: Dict[str, int] = Field(default_factory=dict, description="Dimension scores for the decision")
    thinking_pattern: str = Field(..., description="The thinking style shown")
    key_blind_spot: str = Field(..., description="The main thing missed in this decision")


class DecisionRequest(BaseModel):
    """Request model for processing a user's decision."""

    blueprint: ScenarioBlueprint = Field(..., description="The blueprint returned by /start")
    theme: str = Field(..., description="The original theme/skill being trained")
    scene_number: int = Field(..., ge=1, description="The current scene number")
    scene_narrative: str = Field(..., description="The narrative of the scene where the decision is made")
    options: List[ChoiceOption] = Field(..., description="The options the user chose from")
    choice: str = Field(..., description="The option the user selected (A/B/C/D or custom)")
    reasoning: str = Field(..., description="The user's explanation of WHY they made this choice")
    decision_history: List[DecisionRecord] = Field(
        default_factory=list,
        description="Previous decisions and evaluations (pass back what was returned last time)",
    )
    max_scenes: int = Field(5, ge=1, le=20, description="Maximum scene count for this scenario")


class ProgressReport(BaseModel):
    """Comprehensive progress report across all scenes."""

    overall_growth: str = Field(..., description="How their thinking has evolved (3-4 sentences)")
    score_trajectory: Dict[str, object] = Field(..., description="How each dimension changed over time")
    dominant_pattern: str = Field(..., description="Their most common thinking style")
    underused_strengths: List[str] = Field(..., description="Thinking styles they rarely use but should")
    critical_blind_spot: str = Field(..., description="The #1 thing holding them back")
    best_moment: str = Field(..., description="The scene where they showed the best thinking")
    skill_assessment: SkillAssessment = Field(..., description="Mastery rating of the main theme")
    recommended_focus: str = Field(..., description="What to work on in the next scenario")
    archetype: str = Field(..., description="A thinker archetype name (e.g., 'The Strategic Diplomat')")


class DecisionResponse(BaseModel):
    """Response model containing evaluation, consequences, insight, and the next step."""

    evaluation: DecisionEvaluation = Field(..., description="Evaluation of the decision and reasoning")
    consequences: Consequences = Field(..., description="Consequences of the decision")
    insight: InsightReport = Field(..., description="Meta-cognitive coaching insight")
    scenario_complete: bool = Field(..., description="Whether the scenario is finished")
    decision_history: List[DecisionRecord] = Field(..., description="Updated history — persist this and pass back next time")
    progress_report: Optional[ProgressReport] = Field(
        None,
        description="Final progress report, present when scenario_complete is true",
    )
    next_scene: Optional[Scene] = Field(
        None,
        description="The next scene, present when scenario_complete is false",
    )
    next_options: Optional[List[ChoiceOption]] = Field(
        None,
        description="Options for the next scene, present when scenario_complete is false",
    )
    custom_option_prompt: Optional[str] = Field(
        None,
        description="Custom-option prompt for the next scene",
    )
    status: str = "success"
