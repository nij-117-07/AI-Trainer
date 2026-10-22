from typing import List, Literal, Optional

from pydantic import BaseModel, Field

USER_LEVEL = Literal["beginner", "intermediate", "advanced"]
TARGET_MASTERY = Literal["familiarity", "competency", "expert-level troubleshooting", "architectural-design"]
LEARNING_FOCUS = Literal["practical", "debugging", "theoretical", "project-based"]

# --- Request Models ---


class GuideRequest(BaseModel):
    """Request model for generating a customized learning guide."""

    subject: str = Field(..., example="FastAPI", description="The subject being learned.")
    goal: str = Field(..., example="Become Python Expert", description="The user's end goal.")
    current_level: str = Field(..., example="Intermediate", description="The user's current skill level.")
    count: int = Field(default=3, ge=1, le=10, description="Number of tasks to generate.")
    history: List[str] = Field(default_factory=list, description="Tasks the user has already completed.")
    instructions: Optional[str] = Field(None, example="Clean folder structure", description="Specific preferences.")


class DailyPlannerRequest(BaseModel):
    """Request model for generating a focused daily study plan."""

    master_topic: str = Field(..., example="React.js", description="The broad field of study.")
    subtopic_preference: Optional[str] = Field(None, example="Compound Component Pattern", description="Specific area to focus on today.")
    user_level: USER_LEVEL = Field(..., example="intermediate", description="Current level.")
    target_mastery: TARGET_MASTERY = Field(..., example="architectural-design", description="Depth of understanding to reach.")
    existing_knowledge: str = Field(..., example="Can build basic components and use hooks", description="What the user already knows.")
    learning_focus: LEARNING_FOCUS = Field(..., example="practical", description="Preferred learning style.")
    history: Optional[str] = Field(None, example="State management with Redux", description="Context from the previous session.")


class ProjectArchitectRequest(BaseModel):
    """Request model for generating a unique industry-specific project blueprint."""

    master_topic: str = Field(..., example="Backend Engineering", description="The broad field of study.")
    subtopic_focus: str = Field(..., example="WebSockets & Real-time Communication", description="The specific niche to master.")
    target_mastery: str = Field(..., example="architectural-design", description="The skill level to reach.")
    preferred_industry: Optional[str] = Field(None, example="Healthcare", description="The user's industry of choice.")


class WhatToLearnRequest(BaseModel):
    """Request model for the personalized next-topic recommendation engine."""

    broader_topic: str = Field(..., example="Software Engineering", description="The general domain.")
    specific_interest: str = Field(..., example="Web Development with Python", description="The specific sub-topic of interest.")
    learned_before: str = Field(..., example="Basic Python and introductory Web concepts", description="Background knowledge to build on.")
    previous_suggestions: List[str] = Field(
        default_factory=list,
        example=["Decorators in Python", "Basic Flask Routing"],
        description="Topics already suggested; must not be repeated.",
    )
    custom_user_input: Optional[str] = Field(None, example="I want to focus on security and databases today.", description="Specific constraints or requests.")
    topic_level: str = Field(..., example="intermediate", description="Difficulty: Beginner, Intermediate, or Advanced.")


class ProjectSuggestorRequest(BaseModel):
    """Request model for generating industry-specific project use cases."""

    topic: str = Field(..., example="Vector Databases", description="The core technology or subject matter.")
    industry: str = Field(..., example="Healthcare", description="The vertical to apply the technology.")
    num_use_cases: int = Field(default=3, ge=1, le=10, description="The number of unique project ideas to generate.")
    user_instructions: Optional[str] = Field(None, example="Focus on cost-saving", description="Specific constraints or preferences.")
    existing_suggestions: List[str] = Field(
        default_factory=list,
        example=["AI Patient Triage", "Medical Record Indexer"],
        description="Project titles already suggested; must not be repeated.",
    )


# --- Response Models ---


class Task(BaseModel):
    """A single actionable learning task."""

    title: str = Field(..., description="Name of the project/task.")
    description: str = Field(..., description="Detailed explanation of what to build.")
    difficulty: str = Field(..., description="Easy, Medium, or Hard relative to current level.")
    learning_outcomes: List[str] = Field(default_factory=list, description="Key concepts this task reinforces.")
    estimated_hours: int = Field(..., ge=1, description="Estimated time to complete.")


class GuideResponse(BaseModel):
    """Response model containing the mentor feedback and task list."""

    mentor_feedback: str = Field(..., description="Encouraging assessment of progress and the logic behind the tasks.")
    tasks: List[Task] = Field(default_factory=list, description="The actionable tasks/projects.")


class DailyPlannerResponse(BaseModel):
    """Response model containing a full daily study plan."""

    learning_objective: str = Field(..., description="Clear statement of what will be achieved.")
    mastery_gap_analysis: str = Field(..., description="What is missing to reach the target mastery.")
    structured_roadmap: List[str] = Field(default_factory=list, description="Step-by-step tasks.")
    recommended_exercise: str = Field(..., description="A challenge designed to test the target mastery.")
    resource_suggestions: str = Field(..., description="Recommended learning resources.")


class ProjectArchitectResponse(BaseModel):
    """Response model containing a generated project blueprint."""

    project_name: str = Field(..., description="A unique, professional project name.")
    industry_context: str = Field(..., description="The industry this project belongs to.")
    problem_statement: str = Field(..., description="The real-world problem the project solves.")
    technical_requirements: List[str] = Field(default_factory=list, description="Features required for full knowledge.")
    stretch_goals: List[str] = Field(default_factory=list, description="Advanced features for expert-level mastery.")
    validation_criteria: str = Field(..., description="How the user proves success and mastery.")
    random_seed: str = Field(..., description="The seed used to generate this blueprint.")


class LearningTopicSuggestion(BaseModel):
    """A single recommended next topic."""

    topic_name: str = Field(..., description="The specific subject name.")
    reason: str = Field(..., description="Why this is a good next step.")


class WhatToLearnResponse(BaseModel):
    """Response model containing personalized topic recommendations."""

    recommendations: List[LearningTopicSuggestion] = Field(default_factory=list, description="The suggested topics.")


class ProjectIdea(BaseModel):
    """A single industry-specific project use case."""

    title: str = Field(..., description="A professional project name.")
    problem: str = Field(..., description="The specific industry pain point.")
    key_features: str = Field(..., description="Summary of the 3 most important features.")


class ProjectSuggestorResponse(BaseModel):
    """Response model containing the strategy and project use cases."""

    brief_strategy: str = Field(..., description="How the topic transforms the industry.")
    projects: List[ProjectIdea] = Field(default_factory=list, description="The generated project use cases.")
