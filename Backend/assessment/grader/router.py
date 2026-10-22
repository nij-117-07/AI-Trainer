import logging
from typing import NoReturn, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from assessment.grader.dependencies import get_grader_service, verify_api_key
from assessment.grader.schemas import GradingPayload, GradingResponse
from assessment.grader.services import GraderError, GraderService, InvalidImageError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/grader", tags=["Performance Grader"])


class GraderHTTPError(HTTPException):
    """Base HTTP exception for the performance grader module."""


class GraderValidationError(GraderHTTPError):
    """Raised when the client provides an invalid upload or payload."""


class GraderProcessingError(GraderHTTPError):
    """Raised when the grading pipeline fails to produce a result."""


def _raise_grader_error(exc: GraderError) -> NoReturn:
    """
    Logs the underlying failure and raises the matching module-level HTTP error.

    Args:
        exc (GraderError): The domain exception that caused the failure.

    Raises:
        GraderValidationError: For invalid image uploads.
        GraderProcessingError: For internal grading failures.
    """
    if isinstance(exc, InvalidImageError):
        logger.warning("Invalid image upload: %s", exc)
        raise GraderValidationError(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is not a valid image.",
        )
    logger.error("Grader failed to evaluate submission: %s", exc)
    raise GraderProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to evaluate the submission.",
    )


@router.post("/evaluate", response_model=GradingResponse, status_code=status.HTTP_200_OK)
async def evaluate_submission(
    username: str = Form(..., description="User identifier for storage"),
    scenario: str = Form(..., description="The context of the task"),
    question_asked: str = Form(..., description="The specific question the user is answering"),
    target_objective: str = Form(..., description="The goal the user needs to achieve"),
    expected_level: str = Form(..., description="Required depth, any value accepted"),
    user_answer_text: Optional[str] = Form(None, description="The textual part of the user's response"),
    image: Optional[UploadFile] = File(None, description="The visual part of the user's response"),
    service: GraderService = Depends(get_grader_service),
    _: str = Depends(verify_api_key),
) -> GradingResponse:
    """
    Handles image upload, resize (max 1024px), and AI grading of a submission.

    Args:
        username: User identifier used for image storage.
        scenario: The context of the task.
        question_asked: The specific question the user answered.
        target_objective: The goal the user needed to achieve.
        expected_level: Required depth (any string value).
        user_answer_text: Optional textual part of the answer.
        image: Optional image part of the answer.
        service: Injected grader service.
        _: API key guard dependency.

    Returns:
        GradingResponse: The structured AI evaluation.

    Raises:
        GraderValidationError: If the form data or upload is invalid.
        GraderProcessingError: If the grading pipeline fails.
    """
    answer_text = user_answer_text.strip() if user_answer_text and user_answer_text.strip() else None

    image_bytes = None
    image_filename = None
    if image:
        if not image.content_type or not image.content_type.startswith("image/"):
            raise GraderValidationError(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be an image.",
            )
        image_bytes = await image.read()
        image_filename = image.filename
        logger.info(
            "Image received from %s: %s (%d bytes, type=%s)",
            username,
            image.filename,
            len(image_bytes),
            image.content_type,
        )

    if image_bytes is None and answer_text is None:
        raise GraderValidationError(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provide either user_answer_text or an image to grade.",
        )

    payload = GradingPayload(
        scenario=scenario,
        question_asked=question_asked,
        target_objective=target_objective,
        expected_level=expected_level,
        user_answer_text=answer_text,
    )

    try:
        return await service.evaluate(
            payload=payload,
            username=username,
            image_bytes=image_bytes,
            image_filename=image_filename,
        )
    except GraderError as exc:
        _raise_grader_error(exc)
