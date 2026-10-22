import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from linguistic.lesson.dependencies import get_lesson_service
from linguistic.lesson.schemas import LessonRequest, LessonResponse
from linguistic.lesson.services import GenerationError, LessonService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/lesson", tags=["Lessons"])


class LessonHTTPError(HTTPException):
    """Base HTTP exception for the lesson module."""


class LessonProcessingError(LessonHTTPError):
    """Raised when the generation pipeline fails to produce content."""


def _raise_processing_error(exc: GenerationError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        exc (GenerationError): The domain exception that caused the failure.

    Raises:
        LessonProcessingError: Always.
    """
    logger.error("Lesson engine failed to generate the lesson: %s", exc)
    raise LessonProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to generate the pedagogical content.",
    )


@router.post("/generate", response_model=LessonResponse, status_code=status.HTTP_200_OK)
async def create_lesson(
    payload: LessonRequest,
    service: LessonService = Depends(get_lesson_service),
    _: str = Depends(verify_api_key),
) -> LessonResponse:
    """
    Generates a scaffolded AI language lesson based on user profile and theme.

    Args:
        payload (LessonRequest): The validated request schema.
        service (LessonService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        LessonResponse: The structured scaffolded lesson.

    Raises:
        LessonProcessingError: If the generation pipeline fails.
    """
    try:
        return service.generate_lesson(payload)
    except GenerationError as exc:
        _raise_processing_error(exc)
