import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from learning.motivation.dependencies import get_motivation_service, verify_api_key
from learning.motivation.schemas import MotivationRequest, MotivationResponse, ReflectionRequest, ReflectionResponse
from learning.motivation.services import GenerationError, MotivationService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/motivation", tags=["Motivation & Reflection"])


class MotivationHTTPError(HTTPException):
    """Base HTTP exception for the motivation module."""


class MotivationProcessingError(MotivationHTTPError):
    """Raised when the generation pipeline fails to produce content."""


def _raise_processing_error(action: str, exc: GenerationError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (GenerationError): The domain exception that caused the failure.

    Raises:
        MotivationProcessingError: Always.
    """
    logger.error("Motivation failed to %s: %s", action, exc)
    raise MotivationProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/generate", response_model=MotivationResponse, status_code=status.HTTP_200_OK)
async def create_motivation(
    payload: MotivationRequest,
    service: MotivationService = Depends(get_motivation_service),
    _: str = Depends(verify_api_key),
) -> MotivationResponse:
    """
    Generates a personalized daily motivational quote.

    Args:
        payload (MotivationRequest): The validated request schema.
        service (MotivationService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        MotivationResponse: The generated quote and insight.

    Raises:
        MotivationProcessingError: If the generation pipeline fails.
    """
    try:
        return await service.generate_motivation_quote(payload)
    except GenerationError as exc:
        _raise_processing_error("generate the motivation quote", exc)


@router.post("/reflect", response_model=ReflectionResponse, status_code=status.HTTP_200_OK)
async def create_reflection(
    payload: ReflectionRequest,
    service: MotivationService = Depends(get_motivation_service),
    _: str = Depends(verify_api_key),
) -> ReflectionResponse:
    """
    Generates deep journaling prompts based on the user's mood and goals.

    Args:
        payload (ReflectionRequest): The validated request schema.
        service (MotivationService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        ReflectionResponse: The generated prompts and perspective shift.

    Raises:
        MotivationProcessingError: If the generation pipeline fails.
    """
    try:
        return await service.generate_reflection_session(payload)
    except GenerationError as exc:
        _raise_processing_error("generate the reflection prompts", exc)
