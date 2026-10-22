import logging
from typing import Any, Dict, List, Optional, Tuple

import dspy

from core.dspy_utils import build_lm, run_predictor
from learning.roadmap.schemas import RoadmapRequest, SubtopicRequest

logger = logging.getLogger(__name__)


class RoadmapError(Exception):
    """Base exception for all roadmap module failures."""


class GenerationError(RoadmapError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class PersonaGenerator(dspy.Signature):
    """
    Analyze the user's learning goal and generate a specific expert persona.
    This persona will act as the system prompt for the roadmap generation.
    """

    learning_topic: str = dspy.InputField(desc="The subject matter.")
    target_level: str = dspy.InputField(desc="The expertise level the user wants to reach.")
    persona_requirements: Optional[str] = dspy.InputField(
        desc="Any specific style requirements (e.g., 'academic', 'industry-focused', 'encouraging')."
    )

    generated_persona_prompt: str = dspy.OutputField(
        desc="A detailed system prompt describing the expert persona, their tone, and their pedagogical approach."
    )


class MainTopicGenerator(dspy.Signature):
    """Generate the high-level chapters of a roadmap."""

    persona: str = dspy.InputField(desc="The persona/role to adopt.")
    learning_topic: str = dspy.InputField(desc="The overall subject (e.g., Python).")
    current_level: str = dspy.InputField(desc="Starting point of the user.")
    target_level: str = dspy.InputField(desc="The ultimate goal level.")
    roadmap_type: str = dspy.InputField(desc="How comprehensive the roadmap should be (Detailed or Short).")
    user_instructions: Optional[str] = dspy.InputField(default=None, desc="Specific requests.")

    main_topics: List[str] = dspy.OutputField(desc="List of main headings.")


class SubtopicGenerator(dspy.Signature):
    """
    Generate specific deep-dive points for a particular segment of the roadmap.
    Use the overall goal and the full context to ensure relevance.
    """

    persona: str = dspy.InputField(desc="The persona/role to adopt.")
    learning_topic: str = dspy.InputField(desc="The main subject being learned.")
    user_target_level: str = dspy.InputField(desc="The final expertise level the user wants to reach.")
    full_topic_list: List[str] = dspy.InputField(desc="The sequence of all main topics in the roadmap.")
    current_module: str = dspy.InputField(desc="The specific topic we are currently expanding.")
    roadmap_type: str = dspy.InputField(desc="Detailed or Short (influences number of sub-bullets).")

    subtopics: List[str] = dspy.OutputField(desc="List of specific concepts, tasks, or lessons.")
    milestone: str = dspy.OutputField(desc="A specific project or test to confirm mastery of this module.")


class RoadmapService:
    """Business layer wrapping the DSPy roadmap generation pipelines."""

    def __init__(self) -> None:
        self.lm = build_lm()

    async def generate_roadmap_data(self, data: RoadmapRequest) -> Tuple[str, List[str]]:
        """
        Generates the expert persona and the high-level main topics.

        Args:
            data (RoadmapRequest): The validated request schema.

        Returns:
            Tuple[str, List[str]]: The generated persona prompt and the list of main topics.

        Raises:
            GenerationError: If the DSPy pipeline fails to generate content.
        """
        try:
            logger.info("Step 1: Generating persona for %s", data.subject)
            persona_resp = run_predictor(
                PersonaGenerator,
                self.lm,
                learning_topic=data.subject,
                target_level=data.target_level,
                persona_requirements=data.persona_style,
            )

            active_persona = persona_resp.generated_persona_prompt

            logger.info("Step 2: Generating main topics for %s", data.subject)
            main_resp = run_predictor(
                MainTopicGenerator,
                self.lm,
                persona=active_persona,
                learning_topic=data.subject,
                current_level=data.start_level,
                target_level=data.target_level,
                roadmap_type=data.mode,
                user_instructions=data.user_instructions,
            )

            return active_persona, main_resp.main_topics
        except Exception as exc:
            logger.error("Error in roadmap AI generation for %s: %s", data.subject, exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    async def generate_subtopics(self, data: SubtopicRequest) -> Dict[str, Any]:
        """
        Deep-dives into a specific module and generates subtopics plus a milestone.

        Args:
            data (SubtopicRequest): The validated request schema.

        Returns:
            Dict[str, Any]: The expanded topic, subtopics, and milestone.

        Raises:
            GenerationError: If the DSPy pipeline fails to generate content.
        """
        try:
            logger.info("Expanding subtopics for module: %s", data.current_module)

            sub_resp = run_predictor(
                SubtopicGenerator,
                self.lm,
                persona=data.persona,
                learning_topic=data.subject,
                user_target_level=data.target_level,
                full_topic_list=data.full_topic_list,
                current_module=data.current_module,
                roadmap_type=data.mode,
            )

            return {
                "topic": data.current_module,
                "subtopics": sub_resp.subtopics,
                "milestone": sub_resp.milestone,
            }
        except Exception as exc:
            logger.error("Subtopic generation error for module %s: %s", data.current_module, exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
