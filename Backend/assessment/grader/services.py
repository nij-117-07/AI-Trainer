import base64
import logging
import os
import uuid
from io import BytesIO
from typing import List, Optional

import aiofiles
import dspy
from PIL import Image

from assessment.grader.schemas import GradingPayload, GradingResponse
from core.config import settings
from core.dspy_utils import build_lm, run_predictor

logger = logging.getLogger(__name__)

MAX_IMAGE_DIMENSION = 1024
JPEG_QUALITY = 85


class GraderError(Exception):
    """Base exception for all performance grader failures."""


class GenerationError(GraderError):
    """Raised when the underlying DSPy pipeline fails to produce a grade."""


class InvalidImageError(GraderError):
    """Raised when the uploaded bytes cannot be processed as an image."""


class HybridUserResponseGrader(dspy.Signature):
    """
    You are an expert Evaluator. You will grade a user's submission which may
    consist of text, an image (handwriting, diagram, screenshot), or both.
    Your task is to synthesize all provided inputs, compare them against the
    target objective, and provide a structured evaluation.
    """

    scenario: str = dspy.InputField(description="The context of the task.")
    question_asked: str = dspy.InputField(description="The specific question the user is answering.")
    target_objective: str = dspy.InputField(description="The goal the user needs to achieve.")
    expected_level: str = dspy.InputField(description="Required depth.")
    user_answer_text: Optional[str] = dspy.InputField(default=None, description="The textual part of the user's response.")
    user_answer_image: Optional[dspy.Image] = dspy.InputField(default=None, description="The visual part of the user's response.")

    combined_analysis: str = dspy.OutputField(description="A synthesized summary of both the text and image inputs provided by the user.")
    score: float = dspy.OutputField(description="Score from 0.0 to 10.0.")
    strengths: List[str] = dspy.OutputField(description="Positive aspects of the submission.")
    weaknesses: List[str] = dspy.OutputField(description="Gaps or errors found in text or image.")
    detailed_feedback: str = dspy.OutputField(description="Constructive advice for improvement.")
    is_target_met: bool = dspy.OutputField(description="Whether the objective was achieved.")


class GraderService:
    """Business layer wrapping the DSPy grading pipeline."""

    def __init__(self) -> None:
        self.lm = build_lm(temperature=0.2)

    async def evaluate(
        self,
        payload: GradingPayload,
        username: str,
        image_bytes: Optional[bytes] = None,
        image_filename: Optional[str] = None,
    ) -> GradingResponse:
        """
        Grades a user submission, optionally involving an uploaded image.

        Args:
            payload: The validated grading request.
            username: Identifier used for storing the submitted image.
            image_bytes: Raw bytes of the uploaded image, if any.
            image_filename: Original filename of the uploaded image, if any.

        Returns:
            GradingResponse: The structured AI evaluation.

        Raises:
            InvalidImageError: If the image bytes cannot be decoded.
            GenerationError: If the DSPy pipeline fails to grade the submission.
        """
        processed_bytes = None
        if image_bytes:
            processed_bytes = self._resize_image(image_bytes)
            await self._persist_image(username, processed_bytes, image_filename or ".jpg")

        image_obj = self._to_image(processed_bytes)

        try:
            logger.info("Grading submission for %s (text=%s, image=%s)", username, bool(payload.user_answer_text), image_obj is not None)
            result = run_predictor(
                HybridUserResponseGrader,
                self.lm,
                scenario=payload.scenario,
                question_asked=payload.question_asked,
                target_objective=payload.target_objective,
                expected_level=payload.expected_level,
                user_answer_text=payload.user_answer_text,
                user_answer_image=image_obj,
            )
        except Exception as exc:
            logger.error("Grading failed for %s: %s", username, exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

        return GradingResponse(
            combined_analysis=result.combined_analysis,
            score=float(result.score),
            strengths=result.strengths,
            weaknesses=result.weaknesses,
            detailed_feedback=result.detailed_feedback,
            is_target_met=bool(result.is_target_met),
        )

    def _resize_image(self, image_data: bytes) -> bytes:
        """
        Resizes an image so its longest side is at most MAX_IMAGE_DIMENSION.

        Args:
            image_data: Raw image bytes.

        Returns:
            bytes: JPEG-encoded bytes of the resized image.

        Raises:
            InvalidImageError: If the bytes cannot be decoded as an image.
        """
        try:
            img = Image.open(BytesIO(image_data))
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            img.thumbnail((MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION), Image.LANCZOS)

            output = BytesIO()
            img.save(output, format="JPEG", quality=JPEG_QUALITY, optimize=True)
            return output.getvalue()
        except Exception as exc:
            raise InvalidImageError(f"Could not process uploaded image: {exc}") from exc

    async def _persist_image(self, username: str, data: bytes, filename: str) -> str:
        """
        Stores the resized image under the configured storage directory.

        Args:
            username: Sub-directory used to isolate the user's uploads.
            data: Image bytes to persist.
            filename: Original filename used to derive the extension.

        Returns:
            str: The absolute path the image was written to.
        """
        ext = os.path.splitext(filename)[1] or ".jpg"
        if not ext.startswith("."):
            ext = f".{ext}"

        user_dir = os.path.join(settings.GRADER_STORAGE_DIR, username)
        os.makedirs(user_dir, exist_ok=True)

        file_name = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(user_dir, file_name)

        async with aiofiles.open(file_path, "wb") as out_file:
            await out_file.write(data)

        logger.info("Persisted graded image for %s: %s", username, file_path)
        return file_path

    def _to_image(self, processed_bytes: Optional[bytes]) -> Optional[dspy.Image]:
        """
        Encodes resized image bytes as a base64 data-URI DSPy Image.

        Args:
            processed_bytes: JPEG bytes of the resized image, if any.

        Returns:
            Optional[dspy.Image]: A DSPy Image object or None when no image is present.
        """
        if not processed_bytes:
            return None
        base64_str = base64.b64encode(processed_bytes).decode("utf-8")
        image_uri = f"data:image/jpeg;base64,{base64_str}"
        return dspy.Image(url=image_uri)
