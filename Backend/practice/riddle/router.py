import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from practice.riddle.dependencies import get_riddle_service
from practice.riddle.schemas import (
    EvaluationRequest,
    EvaluationResponse,
    RiddleRequest,
    RiddleResponse,
)
from practice.riddle.services import GenerationError, RiddleError, RiddleService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/riddle", tags=["Riddle Generator"])


class RiddleHTTPError(HTTPException):
    """Base HTTP exception for the riddle module."""


class RiddleProcessingError(RiddleHTTPError):
    """Raised when a DSPy pipeline fails to produce content."""


def _raise_processing_error(action: str, exc: RiddleError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (RiddleError): The domain exception that caused the failure.

    Raises:
        RiddleProcessingError: Always.
    """
    logger.error("Riddle module failed to %s: %s", action, exc)
    raise RiddleProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/generate", response_model=RiddleResponse, status_code=status.HTTP_200_OK)
async def generate_riddle(
    payload: RiddleRequest,
    service: RiddleService = Depends(get_riddle_service),
    _: str = Depends(verify_api_key),
) -> RiddleResponse:
    """
    Generates an adaptive riddle for the given topic and difficulty.

    Args:
        payload (RiddleRequest): The validated request.
        service (RiddleService): Injected service layer.
        _: API key guard dependency.

    Returns:
        RiddleResponse: The generated riddle.

    Raises:
        RiddleProcessingError: If the generation pipeline fails.
    """
    try:
        return await service.generate_riddle(payload)
    except GenerationError as exc:
        _raise_processing_error("generate the riddle", exc)


@router.post("/evaluate", response_model=EvaluationResponse, status_code=status.HTTP_200_OK)
async def evaluate_answer(
    payload: EvaluationRequest,
    service: RiddleService = Depends(get_riddle_service),
    _: str = Depends(verify_api_key),
) -> EvaluationResponse:
    """
    Evaluates a user's answer against the riddle solution.

    Args:
        payload (EvaluationRequest): The validated request.
        service (RiddleService): Injected service layer.
        _: API key guard dependency.

    Returns:
        EvaluationResponse: The correctness verdict and feedback.

    Raises:
        RiddleProcessingError: If the evaluation pipeline fails.
    """
    try:
        return await service.evaluate_answer(payload)
    except GenerationError as exc:
        _raise_processing_error("evaluate the riddle answer", exc)
