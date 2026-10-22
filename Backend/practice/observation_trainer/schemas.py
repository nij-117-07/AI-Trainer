from typing import List, Literal, Optional

from pydantic import BaseModel, Field

ObservationRating = Literal["Beginner", "Intermediate", "Advanced", "Expert"]
ScenarioPriority = Literal["high", "medium", "low"]


class DescribeRequest(BaseModel):
    """Request model for generating a structured description of an image."""

    image: str = Field(..., description="Image input — accepts a URL, base64 string, or file path")
    scenario_context: Optional[str] = Field(
        None,
        description="Optional context about the image domain (e.g., 'crime scene', 'medical scan') to guide description focus",
    )


class DescribeResponse(BaseModel):
    """Response model containing the structured description of an image."""

    detailed_description: str = Field(..., description="A thorough, structured textual description of the image")
    key_elements: List[str] = Field(..., description="The most important visual elements identified")
    subtle_details: List[str] = Field(..., description="Small or easily-overlooked details")
    status: str = "success"


class EvaluateRequest(BaseModel):
    """Request model for evaluating a user's observations of an image."""

    image: str = Field(..., description="The image the user observed — URL, base64, or file path")
    user_observations: str = Field(..., description="What the user has reported observing in the image")
    training_scenario: str = Field(
        ...,
        description="The scenario or task the user is being trained on (e.g., 'Crime scene investigation')",
    )
    context_category: Optional[str] = Field(
        None,
        description="Category of the image (e.g., portrait, landscape, diagram, x-ray, photograph)",
    )


class EvaluateResponse(BaseModel):
    """Response model containing the evaluation of the user's observations."""

    accuracy_assessment: str = Field(..., description="How accurate the user's observations are against the ground truth")
    scenario_relevance: str = Field(..., description="Whether the user noticed elements relevant to their training scenario")
    rating: ObservationRating = Field(..., description="Overall rating of the user's observation skill level")
    score: int = Field(..., ge=1, le=10, description="Numerical score from 1-10")
    strengths: List[str] = Field(..., description="Things the user observed well or correctly")
    areas_for_improvement: List[str] = Field(..., description="Observation habits or areas to work on")
    scenario_feedback: str = Field(..., description="Feedback tailored to the training scenario")
    feedback: str = Field(..., description="Encouraging, constructive feedback message")
    status: str = "success"


class RevealHiddenRequest(BaseModel):
    """Request model for revealing details a user likely missed in an image."""

    image: str = Field(..., description="The image being analyzed — URL, base64, or file path")
    user_observations: str = Field(..., description="What the user has already noticed in the image")
    training_scenario: str = Field(
        ...,
        description="The scenario or task the user is being trained on, which determines which missed details matter most",
    )
    training_focus: Optional[str] = Field(
        None,
        description="Specific area to focus on (e.g., body language, background, lighting, text, patterns)",
    )


class MissedDetail(BaseModel):
    """A single detail the user missed, with its significance."""

    detail: str = Field(..., description="The specific detail missed")
    category: str = Field(..., description="Category like 'foreground', 'background', 'lighting', 'text'")
    significance: str = Field(..., description="Why this detail matters in the context of the training scenario")
    scenario_priority: ScenarioPriority = Field(..., description="How important this is for the user's training goal")


class RevealHiddenResponse(BaseModel):
    """Response model containing the details the user missed."""

    missed_details: List[MissedDetail] = Field(..., description="List of details the user missed")
    potential_score: int = Field(..., ge=1, le=10, description="Score the user could reach if these details were noticed")
    skill_gap: str = Field(..., description="What observation skill the user is lacking for their scenario")
    training_tip: str = Field(..., description="A practical, scenario-specific tip to notice similar details")
    practice_exercise: str = Field(..., description="A suggested exercise to improve the specific observation skill")
    encouragement: str = Field(..., description="Positive, motivating message about improvement")
    status: str = "success"


class ImageAnalysis(BaseModel):
    """Structured ground-truth analysis of the observed image."""

    ground_truth_description: str = Field(..., description="Complete description of what is actually in the image")
    key_elements: List[str] = Field(..., description="The most important visual elements identified")
    subtle_details: List[str] = Field(..., description="Small or easily-overlooked details")


class EvaluationSummary(BaseModel):
    """Summary of the user's observation evaluation."""

    accuracy_assessment: str = Field(..., description="How accurate the user's observations are against the ground truth")
    scenario_relevance: str = Field(..., description="Whether the user noticed elements relevant to their training scenario")
    rating: ObservationRating = Field(..., description="Overall rating of the user's observation skill level")
    score: int = Field(..., ge=1, le=10, description="Numerical score from 1-10")
    strengths: List[str] = Field(..., description="Things the user observed well or correctly")
    areas_for_improvement: List[str] = Field(..., description="Observation habits or areas to work on")
    scenario_feedback: str = Field(..., description="Feedback tailored to the training scenario")
    feedback: str = Field(..., description="Encouraging, constructive feedback message")


class HiddenDetailsSummary(BaseModel):
    """Summary of the hidden details revealed to the user."""

    missed_items: List[MissedDetail] = Field(..., description="List of details the user missed")
    potential_score: int = Field(..., ge=1, le=10, description="Score the user could reach if these details were noticed")
    skill_gap: str = Field(..., description="What observation skill the user is lacking for their scenario")
    training_tip: str = Field(..., description="A practical, scenario-specific tip to notice similar details")
    practice_exercise: str = Field(..., description="A suggested exercise to improve the specific observation skill")
    encouragement: str = Field(..., description="Positive, motivating message about improvement")


class TrainRequest(BaseModel):
    """Request model for running the full observation training pipeline."""

    image: str = Field(..., description="The image the user observed — URL, base64, or file path")
    user_observations: str = Field(..., description="What the user has reported observing in the image")
    training_scenario: str = Field(..., description="The scenario or task the user is being trained on")
    context_category: Optional[str] = Field(
        None,
        description="Category of the image (e.g., portrait, landscape, diagram, x-ray, photograph)",
    )
    training_focus: Optional[str] = Field(
        None,
        description="Specific area to focus on (e.g., body language, background, lighting, text, patterns)",
    )
    reveal_hidden: bool = Field(True, description="Whether to reveal missed details in the response")


class TrainResponse(BaseModel):
    """Response model containing the full observation training result."""

    image_analysis: ImageAnalysis = Field(..., description="Ground-truth analysis of the observed image")
    evaluation: EvaluationSummary = Field(..., description="Evaluation of the user's observations")
    hidden_details: Optional[HiddenDetailsSummary] = Field(
        None,
        description="Hidden details revealed to the user, when requested",
    )
    training_scenario: str = Field(..., description="The scenario the user was trained on")
    status: str = "success"
