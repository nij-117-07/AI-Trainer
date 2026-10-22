import logging
from typing import List, Literal, Optional

import dspy

from core.dspy_utils import build_lm, run_predictor
from linguistic.rewriter.schemas import RewriteRequest, RewriteResponse

logger = logging.getLogger(__name__)


class RewriterError(Exception):
    """Base exception for all rewriter module failures."""


class GenerationError(RewriterError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class TextRewriterSignature(dspy.Signature):
    """
    You are an Expert Content Editor and Copywriter. Your task is to rewrite
    the provided text to improve its quality, adjust its tone, or change its
    structure while preserving the original intent.
    """

    original_text: str = dspy.InputField(desc="The text that needs to be rewritten.")
    target_tone: str = dspy.InputField(desc="Desired tone (e.g., professional, witty, empathetic, concise).")
    audience: str = dspy.InputField(desc="Who the text is being written for.")
    transformation_goal: Literal["paraphrase", "shorten", "expand", "simplify"] = dspy.InputField(desc="The primary objective of the rewrite.")
    custom_instructions: Optional[str] = dspy.InputField(default=None, desc="Specific constraints or rules.")

    rationale: str = dspy.OutputField(desc="Explanation of the stylistic changes made.")
    rewritten_text: str = dspy.OutputField(desc="The final polished version of the text.")
    improvements_made: List[str] = dspy.OutputField(desc="A list of specific changes (e.g., 'Removed passive voice').")


class RewriterService:
    """Business layer wrapping the DSPy text rewriting pipeline."""

    def __init__(self) -> None:
        self.lm = build_lm(cache=False)

    def process_rewrite(self, data: RewriteRequest) -> RewriteResponse:
        """
        Executes the DSPy ChainOfThought rewrite pipeline.

        Args:
            data (RewriteRequest): The validated request schema.

        Returns:
            RewriteResponse: The rationale, rewritten text, and improvements made.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce content.
        """
        try:
            result = run_predictor(
                TextRewriterSignature,
                self.lm,
                original_text=data.original_text,
                target_tone=data.target_tone,
                audience=data.audience,
                transformation_goal=data.transformation_goal,
                custom_instructions=data.custom_instructions or "None",
            )
            logger.info("Successfully processed text rewrite.")
            return RewriteResponse(
                rationale=result.rationale,
                rewritten_text=result.rewritten_text,
                improvements_made=result.improvements_made,
            )
        except Exception as exc:
            logger.error("Rewrite execution failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
