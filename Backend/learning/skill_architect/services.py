import logging
from typing import Any, Dict, List

import dspy

from core.dspy_utils import build_lm, run_predictor
from learning.skill_architect.schemas import SkillArchitectRequest, SkillArchitectResponse, SkillLevel

logger = logging.getLogger(__name__)


class SkillArchitectError(Exception):
    """Base exception for all skill architect module failures."""


class GenerationError(SkillArchitectError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class RootSkillArchitect(dspy.Signature):
    """
    You are an expert Skill Architect and 'Root Skill Teller'.

    Your task is NOT to create a generic syllabus or roadmap. Instead, you must
    deconstruct a domain into its fundamental 'root skills' and structure them
    into a strict, level-wise progression tree.

    For each level, you must define the core competencies, explain the underlying
    mechanics (how things actually work), and define the exact conditions required
    to unlock the next level of mastery.
    """

    domain_or_skill: str = dspy.InputField(
        description="The main subject, craft, or profession the user wants to master."
    )
    current_proficiency: str = dspy.InputField(
        description="The user's current level (e.g., absolute beginner, self-taught, intermediate)."
    )
    target_mastery_level: str = dspy.InputField(
        description="The desired end goal (e.g., Competent Professional, Industry Expert, Master)."
    )
    learning_constraints: str = dspy.InputField(
        default="",
        description="Specific constraints like time, resources, or preferred learning style.",
    )

    core_philosophy: str = dspy.OutputField(
        description="The 'root' nature of this skill: the fundamental truth or mental model of this domain at its core."
    )
    skill_tree_levels: List[Dict[str, Any]] = dspy.OutputField(
        description="""
        A structured, level-wise progression tree (e.g., Level 1: The Roots, Level 2: The Trunk,
        Level 3: The Branches, Level 4: Mastery). Each level dictionary MUST contain exactly:
        - 'level_name': The stage name and its primary focus.
        - 'root_skills': List of absolute core, non-negotiable competencies required at this stage.
        - 'how_it_works': Deep explanation of the underlying mechanics, principles, or 'hidden rules'.
        - 'proof_of_mastery': A specific milestone, project, or test to prove mastery of this level.
        - 'unlock_condition': The exact prerequisite needed to transition to the next level.
        """
    )
    critical_bottleneck: str = dspy.OutputField(
        description="The single most important 'root skill' or concept most people fail to grasp, which causes plateaus."
    )
    strategic_navigation: str = dspy.OutputField(
        description="Actionable advice on how to practice effectively, avoid common learning traps, and accelerate."
    )


class SkillArchitectService:
    """Business layer wrapping the DSPy root-skill tree generation pipeline."""

    def __init__(self) -> None:
        self.lm = build_lm(temperature=0.4, cache=False)

    @staticmethod
    def _as_dict(raw: object) -> Dict[str, Any]:
        """
        Coerces a raw LLM value into a dictionary.

        Args:
            raw (object): The raw LLM output.

        Returns:
            Dict[str, Any]: The dictionary value.
        """
        return raw if isinstance(raw, dict) else {}

    @staticmethod
    def _coerce_list(value: object) -> List[Any]:
        """
        Coerces a raw value into a list.

        Args:
            value (object): The raw LLM output.

        Returns:
            List[Any]: The list value.
        """
        if value is None:
            return []
        if isinstance(value, list):
            return value
        return [value]

    @staticmethod
    def _coerce_str(value: object, default: str = "") -> str:
        """
        Coerces a raw value into a string.

        Args:
            value (object): The raw LLM output.
            default (str): Fallback value.

        Returns:
            str: The coerced string.
        """
        if value is None:
            return default
        return str(value)

    @classmethod
    def _build_levels(cls, raw_items: object) -> List[SkillLevel]:
        """
        Normalizes raw level output into SkillLevel models.

        Args:
            raw_items (object): The raw skill_tree_levels list.

        Returns:
            List[SkillLevel]: Validated skill levels.
        """
        levels: List[SkillLevel] = []
        for item in cls._coerce_list(raw_items):
            data = cls._as_dict(item)
            levels.append(
                SkillLevel(
                    level_name=cls._coerce_str(data.get("level_name")),
                    root_skills=[cls._coerce_str(skill) for skill in cls._coerce_list(data.get("root_skills"))],
                    how_it_works=cls._coerce_str(data.get("how_it_works")),
                    proof_of_mastery=cls._coerce_str(data.get("proof_of_mastery")),
                    unlock_condition=cls._coerce_str(data.get("unlock_condition")),
                )
            )
        return levels

    async def generate_skill_tree(self, data: SkillArchitectRequest) -> SkillArchitectResponse:
        """
        Deconstructs a domain into a level-wise root-skill progression tree.

        Args:
            data (SkillArchitectRequest): The validated request schema.

        Returns:
            SkillArchitectResponse: The core philosophy and structured skill tree.

        Raises:
            GenerationError: If the DSPy pipeline fails to generate content.
        """
        try:
            result = run_predictor(
                RootSkillArchitect,
                self.lm,
                domain_or_skill=data.domain_or_skill,
                current_proficiency=data.current_proficiency,
                target_mastery_level=data.target_mastery_level,
                learning_constraints=data.learning_constraints or "",
            )

            logger.info("Generated skill tree for '%s'", data.domain_or_skill)
            return SkillArchitectResponse(
                core_philosophy=self._coerce_str(result.core_philosophy),
                skill_tree_levels=self._build_levels(result.skill_tree_levels),
                critical_bottleneck=self._coerce_str(result.critical_bottleneck),
                strategic_navigation=self._coerce_str(result.strategic_navigation),
            )
        except Exception as exc:
            logger.error("Skill architect generation failed for %s: %s", data.domain_or_skill, exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
