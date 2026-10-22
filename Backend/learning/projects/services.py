import logging
from typing import Any, Dict, List, Literal, Optional

import dspy

from core.dspy_utils import build_lm, run_predictor
from learning.projects.schemas import ProjectRecommendation, ProjectRecommenderRequest, ProjectRecommenderResponse

logger = logging.getLogger(__name__)


class ProjectsError(Exception):
    """Base exception for all projects module failures."""


class GenerationError(ProjectsError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class LearningProjectRecommender(dspy.Signature):
    """
    You are an expert learning mentor and project architect.
    Your job is to recommend practical, hands-on projects that help learners
    master a given topic at their preferred scope and difficulty level.

    Each recommendation should be:
    - Actionable and clearly scoped
    - Aligned with the learner's current level
    - Include stretch goals for growth
    """

    topic: str = dspy.InputField(description="The subject or technology the learner wants to practice (e.g., 'Python API development', 'React state management', 'SQL joins').")
    project_size: Literal["small", "medium", "large"] = dspy.InputField(description="Desired project scope: small (1-2 days), medium (1 week), large (2-4 weeks).")
    difficulty_level: Literal["beginner", "intermediate", "advanced"] = dspy.InputField(description="Learner's current proficiency: beginner (just started), intermediate (comfortable with basics), advanced (seeking depth).")
    num_recommendations: int = dspy.InputField(description="How many project ideas to return (default: 3).")

    projects: List[Dict[str, Any]] = dspy.OutputField(description="""
        A list of project recommendations. Each is a dictionary with:
        - 'title': Clear, catchy project name
        - 'description': 2-3 sentence overview of what the learner will build
        - 'key_concepts': List of core concepts/skills practiced
        - 'estimated_hours': Approximate hours to complete
        - 'prerequisites': List of prior knowledge needed
        - 'deliverables': Concrete outputs (e.g., 'working CLI tool', 'deployed web app')
        - 'stretch_goals': Optional bonus challenges to level up
    """)
    advice: str = dspy.OutputField(description="Encouraging advice on how to approach the chosen project and maximize learning.")


class ProjectRecommenderService:
    """Business layer wrapping the DSPy learning project recommender pipeline."""

    def __init__(self) -> None:
        self.lm = build_lm(temperature=0.5, cache=False)

    def generate(self, data: ProjectRecommenderRequest) -> ProjectRecommenderResponse:
        """
        Recommends hands-on projects using DSPy.

        Args:
            data (ProjectRecommenderRequest): The validated request schema.

        Returns:
            ProjectRecommenderResponse: The recommended projects and advice.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce content.
        """
        try:
            response = run_predictor(
                LearningProjectRecommender,
                self.lm,
                topic=data.topic,
                project_size=data.project_size,
                difficulty_level=data.difficulty_level,
                num_recommendations=data.num_recommendations,
            )
            projects = [ProjectRecommendation(**proj) for proj in response.projects]
            return ProjectRecommenderResponse(
                projects=projects,
                advice=response.advice,
            )
        except Exception as exc:
            logger.error("Project recommendation generation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
