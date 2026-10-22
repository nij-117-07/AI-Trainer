import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from tools.ai_detector.dependencies import get_ai_detector_service
from tools.ai_detector.schemas import (
    AIDetectionRequest,
    AIDetectionResponse,
    HumanizerRequest,
    HumanizerResponse,
)
from tools.ai_detector.services import (
    AIDetectorService,
    DetectionError,
    HumanizationError,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai_detector", tags=["AI Detector"])


class AIDetectorHTTPError(HTTPException):
    """Base HTTP exception for the AI detector module."""


class DetectionProcessingError(AIDetectorHTTPError):
    """Raised when the detection pipeline fails to produce a result."""


class HumanizationProcessingError(AIDetectorHTTPError):
    """Raised when the humanizer pipeline fails to produce content."""


def _raise_detection_error(exc: DetectionError) -> NoReturn:
    """
    Logs the underlying failure and raises the detection HTTP error.

    Args:
        exc (DetectionError): The domain exception that caused the failure.

    Raises:
        DetectionProcessingError: Always.
    """
    logger.error("AI detector failed to analyze the text: %s", exc)
    raise DetectionProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to analyze the text.",
    )


def _raise_humanization_error(exc: HumanizationError) -> NoReturn:
    """
    Logs the underlying failure and raises the humanizer HTTP error.

    Args:
        exc (HumanizationError): The domain exception that caused the failure.

    Raises:
        HumanizationProcessingError: Always.
    """
    logger.error("AI detector failed to humanize the text: %s", exc)
    raise HumanizationProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to humanize the text.",
    )


@router.post("/detect", response_model=AIDetectionResponse, status_code=status.HTTP_200_OK)
async def detect_ai_text(
    payload: AIDetectionRequest,
    service: AIDetectorService = Depends(get_ai_detector_service),
    _: str = Depends(verify_api_key),
) -> AIDetectionResponse:
    """
    Analyzes text and reports how likely it was AI-generated.

    Args:
        payload (AIDetectionRequest): The validated detection request.
        service (AIDetectorService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        AIDetectionResponse: The AI score, verdict, reason, flagged patterns,
        and suggested changes.

    Raises:
        DetectionProcessingError: If the detection pipeline fails.
    """
    try:
        return service.detect(payload)
    except DetectionError as exc:
        _raise_detection_error(exc)


@router.post("/humanize", response_model=HumanizerResponse, status_code=status.HTTP_200_OK)
async def humanize_text(
    payload: HumanizerRequest,
    service: AIDetectorService = Depends(get_ai_detector_service),
    _: str = Depends(verify_api_key),
) -> HumanizerResponse:
    """
    Rewrites AI-sounding text so it reads like it was written by a person.

    Accepts optional ``additional_comments`` so users can supply extra
    instructions (audience, phrasing to preserve, contextual constraints)
    alongside the detector's feedback.

    Args:
        payload (HumanizerRequest): The validated humanizer request.
        service (AIDetectorService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        HumanizerResponse: The humanized text, changes made, and confidence.

    Raises:
        HumanizationProcessingError: If the humanizer pipeline fails.
    """
    try:
        return service.humanize(payload)
    except HumanizationError as exc:
        _raise_humanization_error(exc)
