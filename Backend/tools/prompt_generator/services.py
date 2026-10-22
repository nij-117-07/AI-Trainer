import logging
import random
import string
from typing import List, Optional

import dspy

from core.dspy_utils import build_lm, run_predictor
from tools.prompt_generator.schemas import PersonaCreate, PersonaResponse

logger = logging.getLogger(__name__)


class PersonaError(Exception):
    """Base exception for all prompt_generator module failures."""


class GenerationError(PersonaError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class GeneralPersonaGenerator(dspy.Signature):
    """
    You are an expert Prompt Engineer. Craft a highly effective System Persona.
    Define: Identity, Tone, Knowledge Boundaries, and Behavioral Rules.
    """

    seed: str = dspy.InputField(desc="Random string to ensure variety.")
    reference_samples: Optional[List[str]] = dspy.InputField(default=None)
    scenario: str = dspy.InputField()
    past_prompt: Optional[str] = dspy.InputField(default=None)
    context: Optional[str] = dspy.InputField(default=None)
    user_instructions: Optional[str] = dspy.InputField(default=None)

    persona_name: str = dspy.OutputField(desc="Professional name for the persona.")
    generated_persona_system_prompt: str = dspy.OutputField(desc="The complete System Prompt.")


class PersonaManager:
    """Business layer wrapping the DSPy persona generation pipeline."""

    def __init__(self) -> None:
        self.lm = build_lm(temperature=0.5, cache=False)

    def generate(self, data: PersonaCreate) -> PersonaResponse:
        """
        Generates or refines an LLM system persona, supporting iterative
        improvement via the optional 'past_prompt'.

        Args:
            data (PersonaCreate): The validated request schema.

        Returns:
            PersonaResponse: The persona name, generated system prompt, and seed used.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce content.
        """
        exec_seed = data.seed or "".join(random.choices(string.ascii_letters + string.digits, k=8))
        logger.info("Generating persona. Scenario: %s | Seed: %s", data.scenario, exec_seed)
        try:
            prediction = run_predictor(
                GeneralPersonaGenerator,
                self.lm,
                scenario=data.scenario,
                context=data.context,
                past_prompt=data.past_prompt,
                seed=exec_seed,
                user_instructions=data.user_instructions,
                reference_samples=data.reference_samples,
            )
            return PersonaResponse(
                persona_name=prediction.persona_name,
                generated_persona_system_prompt=prediction.generated_persona_system_prompt,
                seed_used=exec_seed,
            )
        except Exception as exc:
            logger.error("Persona generation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
