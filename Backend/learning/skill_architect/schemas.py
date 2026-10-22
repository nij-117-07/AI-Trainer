from typing import List, Optional

from pydantic import BaseModel, Field


class SkillLevel(BaseModel):
    """A single stage in the level-wise skill progression tree."""

    level_name: str = Field(..., description="The stage name and its primary focus")
    root_skills: List[str] = Field(..., description="Absolute core, non-negotiable competencies required at this stage")
    how_it_works: str = Field(..., description="Deep explanation of the underlying mechanics and hidden rules")
    proof_of_mastery: str = Field(..., description="A specific milestone, project, or test proving mastery of this level")
    unlock_condition: str = Field(..., description="The exact prerequisite needed to transition to the next level")


class SkillArchitectRequest(BaseModel):
    """Request model for generating a root-skill progression tree."""

    domain_or_skill: str = Field(
        ...,
        description="The main subject, craft, or profession the user wants to master",
    )
    current_proficiency: str = Field(
        ...,
        description="The user's current level (e.g., absolute beginner, self-taught, intermediate)",
    )
    target_mastery_level: str = Field(
        ...,
        description="The desired end goal (e.g., Competent Professional, Industry Expert, Master)",
    )
    learning_constraints: Optional[str] = Field(
        None,
        description="Specific constraints like time, resources, or preferred learning style",
    )


class SkillArchitectResponse(BaseModel):
    """Response model containing the deconstructed skill tree."""

    core_philosophy: str = Field(..., description="The 'root' nature of the skill and its fundamental mental model")
    skill_tree_levels: List[SkillLevel] = Field(..., description="The structured, level-wise progression tree")
    critical_bottleneck: str = Field(..., description="The single root concept most people fail to grasp")
    strategic_navigation: str = Field(..., description="Actionable advice on practice, traps to avoid, and acceleration")
    status: str = "success"
