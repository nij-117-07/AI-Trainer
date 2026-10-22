from typing import List, Literal, Optional

from pydantic import BaseModel, Field

PROJECT_SIZE = Literal["small", "medium", "large"]
DIFFICULTY_LEVEL = Literal["beginner", "intermediate", "advanced"]


class ProjectRecommendation(BaseModel):
    """A single hands-on project recommendation."""

    title: str = Field(..., description="Clear, catchy project name")
    description: str = Field(..., description="2-3 sentence overview of what the learner will build")
    key_concepts: List[str] = Field(..., description="Core concepts/skills practiced")
    estimated_hours: int = Field(..., description="Approximate hours to complete")
    prerequisites: List[str] = Field(..., description="Prior knowledge needed")
    deliverables: List[str] = Field(..., description="Concrete outputs like a working CLI tool or deployed web app")
    stretch_goals: Optional[List[str]] = Field(None, description="Optional bonus challenges to level up")


class ProjectRecommenderRequest(BaseModel):
    """Request model for recommending hands-on learning projects."""

    topic: str = Field(
        ...,
        example="Python API development",
        description="The subject or technology the learner wants to practice",
    )
    project_size: PROJECT_SIZE = Field(
        ...,
        description="Desired project scope: small (1-2 days), medium (1 week), large (2-4 weeks)",
    )
    difficulty_level: DIFFICULTY_LEVEL = Field(
        ...,
        description="Learner's current proficiency level",
    )
    num_recommendations: int = Field(
        default=3,
        ge=1,
        le=10,
        description="How many project ideas to return",
    )


class ProjectRecommenderResponse(BaseModel):
    """Response model containing the recommended projects and advice."""

    projects: List[ProjectRecommendation] = Field(..., description="The recommended projects")
    advice: str = Field(..., description="Encouraging advice on how to approach the chosen project")
